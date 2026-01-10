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

        # Create invite instance
        invite = InviteInstance.objects.create(
            order=order,
            template=order.template,
            schema=copy.deepcopy(order.schema_snapshot),
            public_slug=f"invite-{uuid.uuid4().hex[:10]}"
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