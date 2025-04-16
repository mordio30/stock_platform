from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Trade
from .serializers import TradeSerializer


class TradeListCreateView(generics.ListCreateAPIView):
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TradeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trade.objects.filter(user=self.request.user)


class SellTradeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        trade = get_object_or_404(Trade, pk=pk, user=request.user)

        sell_price = request.data.get('sell_price')
        if not sell_price:
            return Response({'error': 'Sell price required'}, status=status.HTTP_400_BAD_REQUEST)

        trade.sell_price = sell_price
        trade.save()

        serializer = TradeSerializer(trade)
        return Response(serializer.data, status=status.HTTP_200_OK)
