from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
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


# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreatePaymentOrderView(APIView):
    """Create Razorpay order for payment"""
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        template = get_object_or_404(Template, id=template_id, is_active=True, is_published=True)

        # Check if user already owns this template
        existing_order = Order.objects.filter(
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
                "template_id": str(template.id),
            }
        }

        try:
            razorpay_order = razorpay_client.order.create(data=razorpay_order_data)
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                razorpay_order_id=razorpay_order['id'],
                amount=template.price,
                status="PENDING"
            )

            return Response({
                "order_id": str(order.id),
                "razorpay_order_id": razorpay_order['id'],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "amount": template.price,
                "currency": "INR",
                "template_title": template.title,
            })

        except Exception as e:
            order.delete()  # Cleanup failed order
            return Response(
                {"error": f"Failed to create payment order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyPaymentView(APIView):
    """Verify Razorpay payment and create invite"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"error": "Missing payment details"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get payment record
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment record not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify signature
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            payment.status = "FAILED"
            payment.save()
            return Response(
                {"error": "Payment verification failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Payment verified - update records
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = "SUCCESS"
        payment.paid_at = timezone.now()
        payment.save()

        order = payment.order
        order.status = "ACTIVE"
        order.save()

        # Calculate expiry date based on wedding date
        expires_at = None
        try:
            from django.utils.dateparse import parse_date
            wedding_date_str = order.schema_snapshot.get('hero', {}).get('wedding_date')
            if wedding_date_str:
                wedding_date = parse_date(wedding_date_str)
                if wedding_date:
                    # Convert date to datetime and add 30 days
                    from datetime import datetime as dt
                    wedding_datetime = dt.combine(wedding_date, dt.min.time())
                    # Make timezone aware
                    wedding_datetime = timezone.make_aware(wedding_datetime)
                    expires_at = wedding_datetime + timedelta(days=30)
        except (ValueError, TypeError) as e:
            print(f"Error parsing wedding date: {e}")
        
        # Fallback: If wedding date invalid or missing, default to 3 months from now
        if not expires_at:
            expires_at = timezone.now() + timedelta(days=90)

        # Create invite instance
        invite = InviteInstance.objects.create(
            order=order,
            template=order.template,
            schema=copy.deepcopy(order.schema_snapshot),
            public_slug=f"invite-{uuid.uuid4().hex[:10]}",
            expires_at=expires_at
        )

        # Send emails
        self._send_purchase_emails(order, invite)

        return Response({
            "success": True,
            "order_id": str(order.id),
            "invite_id": str(invite.id),
            "editor_url": f"/editor/{invite.id}",
            "invite_url": f"/invite/{invite.public_slug}",
            "message": "Payment successful! Your template is ready."
        })

    def _send_purchase_emails(self, order, invite):
        """Send emails to buyer and admin"""
        try:
            # Email to buyer
            buyer_subject = f"Your {order.template.title} is Ready!"
            buyer_message = f"""
Hi {order.user.username},

Thank you for your purchase!

Template: {order.template.title}
Amount Paid: ₹{order.amount}

Your invite is ready to customize:
Edit: http://yourdomain.com/editor/{invite.id}
Public Link: http://yourdomain.com/invite/{invite.public_slug}

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
                [settings.ADMIN_EMAIL],  # Add this to settings
                fail_silently=True,
            )

        except Exception as e:
            print(f"Email sending failed: {e}")


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
        # Get all orders for this user with their invites
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
            })

        return Response(data)


class UploadInviteImageView(APIView):
    """Upload and resize images for invite instances"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, invite_id):
        # Get invite and verify ownership
        invite = get_object_or_404(
            InviteInstance, 
            id=invite_id, 
            order__user=request.user
        )
        
        # Validate image file
        if 'image' not in request.FILES:
            return Response(
                {"error": "No image provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and WebP are allowed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            return Response(
                {"error": "File too large. Maximum size is 10MB."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Open and process image
            img = Image.open(image_file)
            
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize image (max width 1200px, maintain aspect ratio)
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Generate unique filename
            ext = 'jpg'  # Save as JPEG for consistency
            filename = f"invites/{invite_id}/{uuid.uuid4()}.{ext}"
            
            # Save to temporary file
            from io import BytesIO
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            # Save file
            path = default_storage.save(filename, buffer)
            
            # Build absolute URL
            if settings.DEBUG:
                # Local development
                url = request.build_absolute_uri(settings.MEDIA_URL + path)
            else:
                # Production (S3)
                url = default_storage.url(path)
            
            return Response({
                "url": url,
                "filename": os.path.basename(path)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to process image: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadTemplateImageView(APIView):
    """Upload default images for templates (admin only)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, template_id):
        # Verify admin access
        if request.user.role != "SUPER_ADMIN":
            return Response(
                {"error": "Admin access required"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get template
        from templates_app.models import Template
        template = get_object_or_404(Template, id=template_id)
        
        # Validate image file
        if 'image' not in request.FILES:
            return Response(
                {"error": "No image provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        image_file = request.FILES['image']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if image_file.content_type not in allowed_types:
            return Response(
                {"error": "Invalid file type. Only JPEG, PNG, and WebP are allowed."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if image_file.size > max_size:
            return Response(
                {"error": "File too large. Maximum size is 10MB."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Open and process image
            img = Image.open(image_file)
            
            # Convert RGBA to RGB if needed
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Resize image (max width 1200px, maintain aspect ratio)
            max_width = 1200
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Generate unique filename
            ext = 'jpg'  # Save as JPEG for consistency
            filename = f"templates/{template_id}/{uuid.uuid4()}.{ext}"
            
            # Save to temporary file
            from io import BytesIO
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)
            
            # Save file
            path = default_storage.save(filename, buffer)
            
            # Build absolute URL
            if settings.DEBUG:
                # Local development
                url = request.build_absolute_uri(settings.MEDIA_URL + path)
            else:
                # Production (S3)
                url = default_storage.url(path)
            
            return Response({
                "url": url,
                "filename": os.path.basename(path)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to process image: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )