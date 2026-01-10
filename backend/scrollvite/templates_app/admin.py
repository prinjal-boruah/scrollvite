from django.contrib import admin
from .models import Category, Template, Order


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_published", "is_active")
    list_filter = ("category", "is_published", "is_active")
    search_fields = ("title",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "template", "status", "created_at")
    readonly_fields = ("schema_snapshot",)
