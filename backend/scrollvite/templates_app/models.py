from django.db import models
import uuid
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Template(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    region = models.CharField(max_length=50, null=True, blank=True)

    schema = models.JSONField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    # Template component identifier
    template_component = models.CharField(
        max_length=100,
        default="RoyalWeddingTemplate",
        help_text="React component name for this template design"
    )

    is_published = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Order(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending Payment"),
        ("ACTIVE", "Active"),
        ("EXPIRED", "Expired"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    template = models.ForeignKey(Template, on_delete=models.CASCADE)

    # Payment info
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # LEGACY — do not edit anymore
    schema_snapshot = models.JSONField(editable=False)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.status}"