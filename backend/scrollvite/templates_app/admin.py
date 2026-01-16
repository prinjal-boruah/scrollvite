from django.contrib import admin
from .models import Category, Template, Order


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug')
        }),
        ('Category Image', {
            'fields': ('default_image',),
            'description': 'Upload a category card image'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "is_published", "is_active")
    list_filter = ("category", "is_published", "is_active")
    search_fields = ("title",)
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'category', 'region', 'template_component', 'price')
        }),
        ('Schema', {
            'fields': ('schema',),
            'classes': ('collapse',)
        }),
        ('Default Preview Image', {
            'fields': ('default_hero_image',),
            'description': 'Upload a default hero image for template preview cards'
        }),
        ('Status', {
            'fields': ('is_published', 'is_active','is_preview')
        }),
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "template", "status", "created_at")
    readonly_fields = ("schema_snapshot",)
