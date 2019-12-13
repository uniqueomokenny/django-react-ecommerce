from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from core import models
from .serializers import ProductSerializer


class ProductListView(ListAPIView):
    permission_classes = (AllowAny, )
    serializer_class = ProductSerializer
    queryset = models.Item.objects.all()