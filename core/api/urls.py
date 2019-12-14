from django.urls import path
from . import views


urlpatterns = [
    path('product-list/', views.ProductListView.as_view(), name='product-list'),
    path('add-to-cart/', views.AddtoCartView.as_view(), name='add-to-cart'),
    path('order-summary/', views.OrderDetailView.as_view(), name='order-summary'),
    path('checkout/', views.PaymentView.as_view(), name='checkout'),
]