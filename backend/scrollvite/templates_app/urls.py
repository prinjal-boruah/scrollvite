from django.urls import path
from .views import (
    CategoryListView,
    TemplateListView,
    TemplateDetailView,
    TemplateEditorView,
    TemplateSaveView,
    TemplateByCategoryView,
    CreateOrderView,
    InviteView,
    PreviewTemplatesView,
    TemplatePreviewDetailView,
)

urlpatterns = [
    # Existing authenticated endpoints
    path('categories/', CategoryListView.as_view()),
    path('templates/<slug:category_slug>/', TemplateListView.as_view()),
    path('template-detail/<int:template_id>/', TemplateDetailView.as_view()),
    path('template-editor/<int:template_id>/', TemplateEditorView.as_view()),
    path('template-save/<int:template_id>/', TemplateSaveView.as_view()),
    path('templates-by-category/<slug:category_slug>/', TemplateByCategoryView.as_view()),
    path('create-order/<int:template_id>/', CreateOrderView.as_view()),
    
    # Public endpoints
    path('invite/<slug:slug>/', InviteView.as_view()),
    
    # NEW: Public preview endpoints (no auth required)
    path('preview-templates/', PreviewTemplatesView.as_view()),
    path('template-preview/<int:template_id>/', TemplatePreviewDetailView.as_view()),
]