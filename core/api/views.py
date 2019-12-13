from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from core import models
from .serializers import ItemSerializer, OrderSerializer


class ProductListView(ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = ItemSerializer
    queryset = models.Item.objects.all()


class AddtoCartView(APIView):
    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response({"message": 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
        
        item = get_object_or_404(models.Item, slug=slug)
        order_item, created = models.OrderItem.objects.get_or_create(
            item=item,
            user=request.user,
            ordered=False
        )
        order_qs = models.Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            order = order_qs[0]
            # check if the order item is in the order
            if order.items.filter(item__slug=item.slug).exists():
                order_item.quantity += 1
                order_item.save()
                # messages.info(request, "This item quantity was updated.")
                # return redirect("core:order-summary")
                return Response(status.HTTP_200_OK)
            else:
                order.items.add(order_item)
                # messages.info(request, "This item was added to your cart.")
                # return redirect("core:order-summary")
                return Response(status.HTTP_200_OK)
        else:
            ordered_date = timezone.now()
            order = models.Order.objects.create(user=request.user, ordered_date=ordered_date)
            order.items.add(order_item)
            # messages.info(request, "This item was added to your cart.")
            # return redirect("core:order-summary")
            return Response(status.HTTP_200_OK)


class OrderDetailView(RetrieveAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = OrderSerializer

    def get_object(self):
        try:
            order = models.Order.objects.get(user=self.request.user, ordered=False)
            return order
        except ObjectDoesNotExist:
            return Response({"messages","You do not have an active order"}, status=status.HTTP_400_BAD_REQUEST)