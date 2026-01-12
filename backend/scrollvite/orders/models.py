import uuid
from django.db import models
from django.conf import settings
from templates_app.models import Order, Template


class Payment(models.Model):
    """Track Razorpay payments"""
    PAYMENT_STATUS = (
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    
    # Razorpay details
    razorpay_order_id = models.CharField(max_length=100)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    
    # Payment info
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default="PENDING")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Payment {self.razorpay_order_id} - {self.status}"


class InviteInstance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="invite"
    )

    template = models.ForeignKey(
        Template,
        on_delete=models.PROTECT
    )

    schema = models.JSONField()
    public_slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invite {self.public_slug}"
    
    def is_expired(self):
        """Check if invite has expired"""
        if not self.expires_at:
            return False
        from django.utils import timezone
        return timezone.now() > self.expires_at