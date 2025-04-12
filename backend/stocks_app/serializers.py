from rest_framework import serializers
from .models import Watchlist

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ['id', 'user', 'symbol', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']
