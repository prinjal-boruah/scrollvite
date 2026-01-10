from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import InviteInstance


class InviteInstanceDetailView(APIView):
    """
    GET/PUT endpoint for editing a specific InviteInstance
    Only the owner can access/edit their invite
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, invite_id):
        """Fetch invite instance by ID (only if user owns it)"""
        invite = get_object_or_404(
            InviteInstance,
            id=invite_id,
            order__user=request.user  # Security: only owner can access
        )

        return Response({
            "id": str(invite.id),
            "template_title": invite.template.title,
            "schema": invite.schema,
            "public_slug": invite.public_slug,
            "is_active": invite.is_active,
        })

    def put(self, request, invite_id):
        """Update invite instance schema (only if user owns it)"""
        invite = get_object_or_404(
            InviteInstance,
            id=invite_id,
            order__user=request.user  # Security: only owner can edit
        )

        # Update only the schema (users can't change other fields)
        if "schema" in request.data:
            invite.schema = request.data["schema"]
            invite.save()

        return Response({
            "status": "saved",
            "id": str(invite.id),
            "public_slug": invite.public_slug,
        })