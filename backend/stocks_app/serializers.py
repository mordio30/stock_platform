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
    risk_per_share = serializers.SerializerMethodField()
    reward_per_share = serializers.SerializerMethodField()
    risk_reward_ratio = serializers.SerializerMethodField()

    class Meta:
        model = RiskCalculation
        fields = [
            'id', 'user', 'symbol', 'buy_price', 'stop_loss', 'target_price',
            'risk_per_share', 'reward_per_share', 'risk_reward_ratio', 'date_created'
        ]
        read_only_fields = ['user', 'date_created']

    def get_risk_per_share(self, obj):
        return float(obj.risk_per_share)

    def get_reward_per_share(self, obj):
        return float(obj.reward_per_share)

    def get_risk_reward_ratio(self, obj):
        return float(obj.risk_reward_ratio)
