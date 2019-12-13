from rest_framework import serializers
from core import models


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()

    class Meta:
        model = models.Item
        fields = [
            'id',
            'title',
            'category',
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