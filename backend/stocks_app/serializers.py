from rest_framework import serializers
from .models import Watchlist
from .models import PortfolioItem
from .models import RiskCalculation

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'user', 'symbol', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']

class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = [
            'id', 'user', 'symbol', 'shares',
            'buy_price', 'sell_price', 'stop_price', 'target_price',
            'is_closed', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'is_closed']

class RiskCalculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskCalculation
        fields = '__all__'
        read_only_fields = ['user', 'date_created']