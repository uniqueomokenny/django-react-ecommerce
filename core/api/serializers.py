from rest_framework import serializers
from core import models


class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value

class ItemSerializer(serializers.ModelSerializer):
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
    item_obj = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = models.OrderItem
        fields = [
            'id',
            'item',
            'item_obj',
            'final_price',
            'quantity',
        ]

    def get_item_obj(self, obj):
        return ItemSerializer(obj.item).data

    def get_final_price(self, obj):
        return obj.get_final_price()

class CouponSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Coupon
        fields = ['id', 'code', 'amount']


class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = models.Order
        fields = [
            'id',
            'order_items',
            'coupon',
            'total'
        ]

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

    def get_total(self, obj):
        return obj.get_total()

    def get_coupon(self, obj):
        if obj.coupon is not None:
            return CouponSerializer(obj.coupon).data

        return None