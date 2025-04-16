from rest_framework import serializers
from .models import Trade

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['id', 'user', 'symbol', 'quantity', 'purchase_price', 'sell_price', 'date_bought']
        read_only_fields = ['user', 'date_bought']
