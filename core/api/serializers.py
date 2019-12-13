from rest_framework import serializers
from core import models


class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = models.Item
        fields = [
            'id',
            'title',
            'category',
            'slug',
            'price',
            'discount_price',
            'label',
            'description',
            'image'
        ]

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()


class OrderItemSerializer(serializers.ModelSerializer):
    item = StringSerializer()

    class Meta:
        model = models.OrderItem
        fields = [
            'id',
            'item',
            'quantity',
        ]

    def get_order_items(self, obj):
        return obj.get_category_display()


class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()

    class Meta:
        model = models.Order
        fields = [
            'id',
            'order_items'
        ]

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data