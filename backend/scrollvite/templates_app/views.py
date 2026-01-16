from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Category, Template
from orders.models import InviteInstance
from .serializers import CategorySerializer, TemplateSerializer
from .permissions import IsSuperAdmin
from .models import Order
from django.shortcuts import get_object_or_404
import copy
import uuid

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(is_active=True)
        return Response(CategorySerializer(categories, many=True).data)


class TemplateListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_slug):
        # Admin sees all templates (published + unpublished)
        # Buyers see only published templates
        if request.user.role == "SUPER_ADMIN":
            templates = Template.objects.filter(
                category__slug=category_slug,
                is_active=True
            )
        else:
            templates = Template.objects.filter(
                category__slug=category_slug,
                is_active=True,
                is_published=True
            )
        
        return Response(TemplateSerializer(templates, many=True).data)


class TemplateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        template = Template.objects.get(
            id=template_id,
            is_active=True,
            is_published=True
        )
        return Response(TemplateSerializer(template).data)


class TemplateEditorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, template_id):
        template = Template.objects.get(id=template_id)
        return Response({
            "id": template.id,
            "title": template.title,
            "schema": template.schema,
            "is_published": template.is_published,
            "price": str(template.price),
            "template_component": template.template_component,
        })


class TemplateSaveView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def post(self, request, template_id):
        template = Template.objects.get(id=template_id)

        template.schema = request.data.get("schema", template.schema)
        template.is_published = request.data.get("is_published", template.is_published)

        template.save()

        return Response({"status": "saved"})


class TemplateByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, category_slug):
        templates = Template.objects.filter(
            category__slug=category_slug,
            is_active=True,
            is_published=True
        )
        serializer = TemplateSerializer(templates, many=True)
        return Response(serializer.data)


# ==================== NEW PUBLIC ENDPOINTS ====================

class PreviewTemplatesView(APIView):
    """
    Public endpoint - Returns max 5 templates for homepage preview
    No authentication required
    """
    permission_classes = []

    def get(self, request):
        templates = Template.objects.filter(
            is_active=True,
            is_published=True,
            is_preview=True
        ).order_by('-created_at')[:5]  # Max 5 templates, newest first
        
        serializer = TemplateSerializer(templates, many=True)
        return Response(serializer.data)


class TemplatePreviewDetailView(APIView):
    """
    Public endpoint - Returns single template for demo preview
    No authentication required
    Only accessible if template has is_preview=True
    """
    permission_classes = []

    def get(self, request, template_id):
        template = get_object_or_404(
            Template,
            id=template_id,
            is_active=True,
            is_published=True,
            is_preview=True
        )
        
        # Build response with necessary fields
        response_data = {
            "id": template.id,
            "title": template.title,
            "schema": template.schema,
            "template_component": template.template_component,
            "price": str(template.price),
        }
        
        # Add default_hero_image URL if exists
        if template.default_hero_image:
            response_data["default_hero_image_url"] = request.build_absolute_uri(
                template.default_hero_image.url
            )
        else:
            response_data["default_hero_image_url"] = None
        
        return Response(response_data)


# ==================== EXISTING ENDPOINTS ====================

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        template = get_object_or_404(Template, id=template_id)

        # ✅ CHECK: Does user already have an active order for this template?
        existing_order = Order.objects.filter(
            user=request.user,
            template=template,
            status="ACTIVE"
        ).first()

        if existing_order:
            # User already bought this - return existing invite
            invite = InviteInstance.objects.get(order=existing_order)
            
            return Response({
                "order_id": str(existing_order.id),
                "invite_id": str(invite.id),
                "invite_url": f"/invite/{invite.public_slug}",
                "editor_url": f"/editor/{invite.id}",
                "message": "You already own this template"
            })

        # ✅ NEW PURCHASE: Create order and invite
        order = Order.objects.create(
            user=request.user,
            template=template,
            schema_snapshot=copy.deepcopy(template.schema)
        )

        invite = InviteInstance.objects.create(
            order=order,
            template=template,
            schema=copy.deepcopy(template.schema),
            public_slug=f"invite-{uuid.uuid4().hex[:10]}"
        )

        return Response({
            "order_id": str(order.id),
            "invite_id": str(invite.id),
            "invite_url": f"/invite/{invite.public_slug}",
            "editor_url": f"/editor/{invite.id}",
            "message": "Template purchased successfully"
        })

    
class InviteView(APIView):
    permission_classes = []

    def get(self, request, slug):
        invite = get_object_or_404(
            InviteInstance,
            public_slug=slug,
            is_active=True
        )

        # Check if expired
        if invite.is_expired():
            return Response({
                "expired": True,
                "message": "This invitation has expired. Please contact the host."
            }, status=status.HTTP_410_GONE)

        return Response({
            "schema": invite.schema,
            "template_component": invite.template.template_component,
        })
    