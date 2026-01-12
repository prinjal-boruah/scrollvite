from rest_framework import serializers
from .models import Category, Template

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'title', 'price', 'is_published', 'category', 'region', 'template_component']

