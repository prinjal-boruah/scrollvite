import uuid
from django.db import models
from django.conf import settings
from templates_app.models import Order,Template


class InviteInstance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    order = models.OneToOneField(
        Order,                      # 👈 EXPLICIT import
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
