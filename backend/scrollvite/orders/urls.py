from django.urls import path
from .views import (
    InviteInstanceDetailView, 
    CreatePaymentOrderView, 
    VerifyPaymentView, 
    MyTemplatesView,
    UploadInviteImageView 
)

urlpatterns = [
    path("invites/<uuid:invite_id>/", InviteInstanceDetailView.as_view(), name="invite-detail"),
    path("invites/<uuid:invite_id>/upload-image/", UploadInviteImageView.as_view(), name="upload-invite-image"),  # ADD THIS
    path("create-payment-order/<int:template_id>/", CreatePaymentOrderView.as_view(), name="create-payment-order"),
    path("verify-payment/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("my-templates/", MyTemplatesView.as_view(), name="my-templates"),
]