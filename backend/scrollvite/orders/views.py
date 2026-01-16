from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from django.db import transaction
from .models import InviteInstance, Payment
from templates_app.models import Order, Template
import razorpay
import copy
import uuid
import hmac
import hashlib
from datetime import timedelta
from django.core.files.storage import default_storage
from PIL import Image
import os
import logging

logger = logging.getLogger(__name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreatePaymentOrderView(APIView):
    """Create Razorpay order for payment with duplicate prevention"""
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        # Validate template exists and is available
        template = get_object_or_404(
            Template, 
            id=template_id, 
            is_active=True, 
            is_published=True
        )

        # CRITICAL: Use database transaction and row-level locking
        with transaction.atomic():
            # Check if user already owns this template (with SELECT FOR UPDATE to prevent race)
            existing_order = Order.objects.select_for_update().filter(
                user=request.user,
                template=template,
                status="ACTIVE"
            ).first()

            if existing_order:
                invite = InviteInstance.objects.get(order=existing_order)
                return Response({
                    "already_purchased": True,
                    "order_id": str(existing_order.id),
                    "invite_id": str(invite.id),
                    "editor_url": f"/editor/{invite.id}",
                    "message": "You already own this template"
                })

            # Check for pending orders from this user for this template
            # Prevent duplicate order creation if user clicks "Buy" multiple times
            pending_order = Order.objects.select_for_update().filter(
                user=request.user,
                template=template,
                status="PENDING",
                created_at__gte=timezone.now() - timedelta(minutes=15)  # Only recent pending orders
            ).first()

            if pending_order:
                # Return existing pending order instead of creating duplicate
                try:
                    payment = Payment.objects.get(order=pending_order)
                    return Response({
                        "order_id": str(pending_order.id),
                        "razorpay_order_id": payment.razorpay_order_id,
                        "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                        "amount": str(pending_order.amount),
                        "currency": "INR",
                        "template_title": template.title,
                    })
                except Payment.DoesNotExist:
                    # Payment record missing, delete corrupted order
                    pending_order.delete()

            # Validate amount (must be positive)
            if template.price <= 0:
                return Response(
                    {"error": "Invalid template price"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create order in our database (PENDING status)
            order = Order.objects.create(
                user=request.user,
                template=template,
                amount=template.price,
                schema_snapshot=copy.deepcopy(template.schema),
                status="PENDING"
            )

            # Create Razorpay order
            razorpay_order_data = {
                "amount": int(template.price * 100),  # Convert to paise
                "currency": "INR",
                "receipt": str(order.id),
                "notes": {
                    "order_id": str(order.id),
                    "user_id": str(request.user.id),
                    "user_email": request.user.email,
                    "template_id": str(template.id),
                    "template_title": template.title,
                }
            }

            try:
                razorpay_order = razorpay_client.order.create(data=razorpay_order_data)
                
                # Create payment record with idempotency
                payment = Payment.objects.create(
                    order=order,
                    razorpay_order_id=razorpay_order['id'],
                    amount=template.price,
                    status="PENDING"
                )

                logger.info(f"Payment order created: Order {order.id}, Razorpay {razorpay_order['id']}")

                return Response({
                    "order_id": str(order.id),
                    "razorpay_order_id": razorpay_order['id'],
                    "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                    "amount": str(template.price),
                    "currency": "INR",
                    "template_title": template.title,
                })

            except razorpay.errors.BadRequestError as e:
                logger.error(f"Razorpay error: {str(e)}")
                order.delete()
                return Response(
                    {"error": "Payment gateway error. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except Exception as e:
                logger.error(f"Unexpected error creating payment: {str(e)}")
                order.delete()
                return Response(
                    {"error": "Failed to create payment order. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


class VerifyPaymentView(APIView):
    """Verify Razorpay payment with comprehensive security checks"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        # Validation 1: Check all required fields
        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            logger.warning(f"Missing payment details from user {request.user.id}")
            return Response(
                {"error": "Missing payment details"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use atomic transaction for all database operations
        with transaction.atomic():
            # Validation 2: Get payment record with row lock
            try:
                payment = Payment.objects.select_for_update().get(
                    razorpay_order_id=razorpay_order_id
                )
            except Payment.DoesNotExist:
                logger.error(f"Payment record not found for order {razorpay_order_id}")
                return Response(
                    {"error": "Payment record not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Validation 3: Check if payment already processed (prevent replay attacks)
            if payment.status == "SUCCESS":
                logger.warning(f"Duplicate payment verification attempt: {razorpay_payment_id}")
                # Payment already successful - return existing invite
                order = payment.order
                invite = InviteInstance.objects.get(order=order)
                return Response({
                    "success": True,
                    "order_id": str(order.id),
                    "invite_id": str(invite.id),
                    "editor_url": f"/editor/{invite.id}",
                    "invite_url": f"/invite/{invite.public_slug}",
                    "message": "Payment already processed."
                })

            # Validation 4: Verify user owns this payment
            if payment.order.user != request.user:
                logger.error(f"User {request.user.id} trying to verify payment for order {payment.order.id}")
                return Response(
                    {"error": "Unauthorized access"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validation 5: Verify signature (prevent tampering)
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
                hashlib.sha256
            ).hexdigest()

            if generated_signature != razorpay_signature:
                logger.error(f"Invalid signature for payment {razorpay_payment_id}")
                payment.status = "FAILED"
                payment.save()
                return Response(
                    {"error": "Payment verification failed - invalid signature"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validation 6: Fetch payment from Razorpay API to verify amount and status
            try:
                razorpay_payment = razorpay_client.payment.fetch(razorpay_payment_id)
                
                # Check payment status from Razorpay
                if razorpay_payment.get('status') != 'captured' and razorpay_payment.get('status') != 'authorized':
                    logger.error(f"Payment {razorpay_payment_id} status is {razorpay_payment.get('status')}")
                    payment.status = "FAILED"
                    payment.save()
                    return Response(
                        {"error": f"Payment not successful. Status: {razorpay_payment.get('status')}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validation 7: Verify amount matches (prevent amount manipulation)
                expected_amount = int(payment.amount * 100)  # Convert to paise
                actual_amount = razorpay_payment.get('amount')
                
                if actual_amount != expected_amount:
                    logger.error(
                        f"Amount mismatch: Expected {expected_amount}, Got {actual_amount} "
                        f"for payment {razorpay_payment_id}"
                    )
                    payment.status = "FAILED"
                    payment.save()
                    return Response(
                        {"error": "Payment amount verification failed"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Validation 8: Verify order_id matches
                if razorpay_payment.get('order_id') != razorpay_order_id:
                    logger.error(f"Order ID mismatch for payment {razorpay_payment_id}")
                    payment.status = "FAILED"
                    payment.save()
                    return Response(
                        {"error": "Payment verification failed - order mismatch"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except razorpay.errors.BadRequestError as e:
                logger.error(f"Razorpay API error fetching payment {razorpay_payment_id}: {str(e)}")
                payment.status = "FAILED"
                payment.save()
                return Response(
                    {"error": "Payment verification failed - could not verify with payment gateway"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f"Unexpected error verifying payment {razorpay_payment_id}: {str(e)}")
                return Response(
                    {"error": "Payment verification failed - unexpected error"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Validation 9: Verify template is still available
            order = payment.order
            template = order.template
            if not template.is_active or not template.is_published:
                logger.error(f"Template {template.id} no longer available for order {order.id}")
                payment.status = "FAILED"
                payment.save()
                # In production, you might want to initiate a refund here
                return Response(
                    {"error": "Template is no longer available. Contact support for refund."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # All validations passed - update payment record
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = "SUCCESS"
            payment.paid_at = timezone.now()
            payment.save()

            # Update order status
            order.status = "ACTIVE"
            order.save()

            # Calculate expiry date based on wedding date
            expires_at = self._calculate_expiry_date(order.schema_snapshot)

            # Create invite instance
            invite = InviteInstance.objects.create(
                order=order,
                template=template,
                schema=copy.deepcopy(order.schema_snapshot),
                public_slug=f"invite-{uuid.uuid4().hex[:10]}",
                expires_at=expires_at
            )

            logger.info(f"Payment verified successfully: Order {order.id}, Invite {invite.id}")

            # Send emails (non-blocking)
            try:
                self._send_purchase_emails(order, invite)
            except Exception as e:
                logger.error(f"Failed to send emails for order {order.id}: {str(e)}")
                # Don't fail the transaction if email fails

            return Response({
                "success": True,
                "order_id": str(order.id),
                "invite_id": str(invite.id),
                "editor_url": f"/editor/{invite.id}",
                "invite_url": f"/invite/{invite.public_slug}",
                "message": "Payment successful! Your template is ready."
            })

    def _calculate_expiry_date(self, schema):
        """Calculate invite expiry date based on wedding date"""
        expires_at = None
        try:
            from django.utils.dateparse import parse_date
            wedding_date_str = schema.get('hero', {}).get('wedding_date')
            if wedding_date_str:
                wedding_date = parse_date(wedding_date_str)
                if wedding_date:
                    from datetime import datetime as dt
                    wedding_datetime = dt.combine(wedding_date, dt.min.time())
                    wedding_datetime = timezone.make_aware(wedding_datetime)
                    expires_at = wedding_datetime + timedelta(days=30)
        except (ValueError, TypeError) as e:
            logger.warning(f"Error parsing wedding date: {e}")
        
        # Fallback: 3 months from now if wedding date invalid
        if not expires_at:
            expires_at = timezone.now() + timedelta(days=90)
        
        return expires_at

    def _send_purchase_emails(self, order, invite):
        """Send emails to buyer and admin"""
        # Email to buyer
        buyer_subject = f"Your {order.template.title} is Ready! 🎉"
        buyer_message = f"""
Hi {order.user.username},

Thank you for your purchase!

Template: {order.template.title}
Amount Paid: ₹{order.amount}

Your invite is ready to customize:
Edit: {settings.FRONTEND_URL}/editor/{invite.id}
Public Link: {settings.FRONTEND_URL}/invite/{invite.public_slug}

Best regards,
ScrollVite Team
        """
        
        send_mail(
            buyer_subject,
            buyer_message,
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            fail_silently=True,
        )

        # Email to admin
        admin_subject = f"New Purchase: {order.template.title}"
        admin_message = f"""
New purchase received!

Customer: {order.user.email}
Template: {order.template.title}
Amount: ₹{order.amount}
Order ID: {order.id}
Date: {order.created_at}
        """
        
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.ADMIN_EMAIL],
            fail_silently=True,
        )


# Keep all other views (InviteInstanceDetailView, MyTemplatesView, etc.) as they are
# Only payment views needed security updates


class InviteInstanceDetailView(APIView):
    """GET/PUT endpoint for editing a specific InviteInstance"""
    permission_classes = [IsAuthenticated]

    def get(self, request, invite_id):
        invite = get_object_or_404(
            InviteInstance,
            id=invite_id,
            order__user=request.user
        )

        return Response({
            "id": str(invite.id),
            "template_title": invite.template.title,
            "template_component": invite.template.template_component,
            "schema": invite.schema,
            "public_slug": invite.public_slug,
            "is_active": invite.is_active,
            "expires_at": invite.expires_at,
        })

    def put(self, request, invite_id):
        invite = get_object_or_404(
            InviteInstance,
            id=invite_id,
            order__user=request.user
        )

        if "schema" in request.data:
            invite.schema = request.data["schema"]
            invite.save()

        return Response({
            "status": "saved",
            "id": str(invite.id),
            "public_slug": invite.public_slug,
        })
    
    
class MyTemplatesView(APIView):
    """Get all templates purchased by the user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invites = InviteInstance.objects.filter(
            order__user=request.user
        ).select_related('template', 'order').order_by('-created_at')

        data = []
        for invite in invites:
            data.append({
                "invite_id": str(invite.id),
                "template_id": invite.template.id,
                "template_title": invite.template.title,
                "template_component": invite.template.template_component,
                "public_slug": invite.public_slug,
                "created_at": invite.created_at,
                "expires_at": invite.expires_at,
                "is_expired": invite.is_expired(),
                "bride_name": invite.schema.get('hero', {}).get('bride_name', ''),
                "groom_name": invite.schema.get('hero', {}).get('groom_name', ''),
                "schema": invite.schema,
            })

        return Response(data)


class UploadInviteImageView(APIView):
    """Upload and resize images for invite instances"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invite_id):
        invite = get_object_or_404(
            InviteInstance, 
            id=invite_id, 
            order__user=request.user
        )
        
        if 'image' not in request.FILES:
            return Response(
                {"error": "No image provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and WebP are allowed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_size = 10 * 1024 * 1024
        if image_file.size > max_size:
            return Response(
                {"error": "File too large. Maximum size is 10MB."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            img = Image.open(image_file)
            
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            ext = 'jpg'
            filename = f"invites/{invite_id}/{uuid.uuid4()}.{ext}"
            
            from io import BytesIO
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            path = default_storage.save(filename, buffer)
            
            if settings.DEBUG:
                url = request.build_absolute_uri(settings.MEDIA_URL + path)
            else:
                url = default_storage.url(path)
            
            return Response({
                "url": url,
                "filename": os.path.basename(path)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Image upload error: {str(e)}")
            return Response(
                {"error": f"Failed to process image: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadTemplateImageView(APIView):
    """Upload default images for templates (admin only)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, template_id):
        if request.user.role != "SUPER_ADMIN":
            return Response(
                {"error": "Admin access required"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        from templates_app.models import Template
        template = get_object_or_404(Template, id=template_id)
        
        if 'image' not in request.FILES:
            return Response(
                {"error": "No image provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and WebP are allowed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        max_size = 10 * 1024 * 1024
        if image_file.size > max_size:
            return Response(
                {"error": "File too large. Maximum size is 10MB."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            img = Image.open(image_file)
            
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            ext = 'jpg'
            filename = f"templates/{template_id}/{uuid.uuid4()}.{ext}"
            
            from io import BytesIO
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            path = default_storage.save(filename, buffer)
            
            if settings.DEBUG:
                url = request.build_absolute_uri(settings.MEDIA_URL + path)
            else:
                url = default_storage.url(path)
            
            return Response({
                "url": url,
                "filename": os.path.basename(path)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Template image upload error: {str(e)}")
            return Response(
                {"error": f"Failed to process image: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )