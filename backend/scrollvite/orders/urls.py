from django.urls import path
from .views import InviteInstanceDetailView

urlpatterns = [
    path("invites/<uuid:invite_id>/", InviteInstanceDetailView.as_view(), name="invite-detail"),
]