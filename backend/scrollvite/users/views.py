import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"


class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        id_token = request.data.get("id_token")

        if not id_token:
            return Response({"error": "id_token required"}, status=400)

        # ✅ VERIFY ID TOKEN (CORRECT WAY)
        token_info_response = requests.get(
            GOOGLE_TOKEN_INFO_URL,
            params={"id_token": id_token},
        )

        if token_info_response.status_code != 200:
            return Response({"error": "Invalid Google token"}, status=401)

        token_info = token_info_response.json()

        email = token_info.get("email")
        google_id = token_info.get("sub")

        if not email:
            return Response({"error": "Email not available"}, status=400)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "google_id": google_id,
                "role": "BUYER",
            },
        )

        if user.google_id is None:
            user.google_id = google_id
            user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
            },
        })
