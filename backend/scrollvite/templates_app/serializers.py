from rest_framework import serializers
from .models import Category, Template
from django.conf import settings

class CategorySerializer(serializers.ModelSerializer):
    default_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'is_active', 'default_image_url']
    
    def get_default_image_url(self, obj):
        if obj.default_image:
            api_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            return f"{api_url}{obj.default_image.url}"
        return None


class TemplateSerializer(serializers.ModelSerializer):
    default_hero_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Template
        fields = ['id', 'title', 'price', 'is_published', 'category', 'region', 'template_component', 'schema', 'default_hero_image_url']
    
    def get_default_hero_image_url(self, obj):
        if obj.default_hero_image:
            # Build the full URL using the backend URL from settings
            api_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000')
            return f"{api_url}{obj.default_hero_image.url}"
        return None

