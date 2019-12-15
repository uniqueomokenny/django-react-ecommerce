from django.urls import path
from . import views


urlpatterns = [
    path('products/', views.ItemListView.as_view(), name='products'),
    path('products/<pk>/', views.ItemDetailView.as_view(), name='product-detail'),
    path('add-to-cart/', views.AddtoCartView.as_view(), name='add-to-cart'),
    path('order-summary/', views.OrderDetailView.as_view(), name='order-summary'),
    path('checkout/', views.PaymentView.as_view(), name='checkout'),
    path('add-coupon/', views.AddCouponView.as_view(), name='add-coupon'),
]