from django.urls import path
from .views import  CategoryListView, TemplateSaveView, \
    TemplateListView, TemplateDetailView, TemplateEditorView, \
        TemplateByCategoryView, CreateOrderView, InviteView

urlpatterns = [
    path("categories/", CategoryListView.as_view()),
    path("templates/<slug:category_slug>/", TemplateListView.as_view()),
    path("template/<int:template_id>/", TemplateDetailView.as_view()),
    path("template-editor/<int:template_id>/", TemplateEditorView.as_view()),
    path("template-save/<int:template_id>/", TemplateSaveView.as_view()),
    path("templates/<slug:category_slug>/", TemplateByCategoryView.as_view()),
    # path("buy/<int:template_id>/", CreateOrderView.as_view()),
    path("invite/<slug:slug>/", InviteView.as_view()),
]
