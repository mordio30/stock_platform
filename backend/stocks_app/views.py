import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from .models import Watchlist, PortfolioItem, RiskCalculation
from .serializers import RiskCalculationSerializer, WatchlistSerializer, PortfolioItemSerializer
from .services import fetch_stock_data

# Public stock search
@api_view(['GET'])
def stock_search(request):
    symbol = request.GET.get('symbol', '').upper()
    if not symbol:
        return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)

    data = fetch_stock_data(symbol)

    if 'Global Quote' in data and data['Global Quote']:
        quote = data['Global Quote']
        cleaned = {
            'symbol': quote.get('01. symbol'),
            'price': quote.get('05. price'),
            'open': quote.get('02. open'),
            'high': quote.get('03. high'),
            'low': quote.get('04. low'),
            'volume': quote.get('06. volume'),
            'latest_trading_day': quote.get('07. latest trading day'),
            'previous_close': quote.get('08. previous close'),
            'change': quote.get('09. change'),
            'change_percent': quote.get('10. change percent'),
        }
        return Response(cleaned)
    elif 'Note' in data:
        return Response({'error': 'API rate limit exceeded'}, status=429)
    elif 'Error Message' in data or not data:
        return Response({'error': 'Stock not found or invalid symbol'}, status=404)
    else:
        return Response({'error': 'Unexpected response from API'}, status=502)

# Watchlist GET/POST
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_view(request):
    if request.method == 'GET':
        watchlist = Watchlist.objects.filter(user=request.user)
        enriched = []

        for item in watchlist:
            stock_data = fetch_stock_data(item.symbol)
            try:
                price = float(stock_data['Global Quote']['05. price'])
            except Exception:
                price = "N/A"
            enriched.append({
                'id': item.id,  # Include the id here
                'symbol': item.symbol,
                'price': price
            })

        return Response(enriched)

    elif request.method == 'POST':
        serializer = WatchlistSerializer(data=request.data)
        if serializer.is_valid():
            symbol = serializer.validated_data['symbol'].upper()

            # Prevent duplicates
            exists = Watchlist.objects.filter(user=request.user, symbol=symbol).exists()
            if exists:
                return Response({'error': 'Symbol already in watchlist.'}, status=400)

            serializer.save(user=request.user, symbol=symbol)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

# Delete from watchlist (using pk)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_watchlist_item(request, pk):  # Use pk (id) here
    item = Watchlist.objects.filter(user=request.user, pk=pk).first()  # Filter by id

    if item:
        item.delete()
        return Response({'message': f'{item.symbol} removed from watchlist.'})
    return Response({'error': 'Item not found in your watchlist.'}, status=404)

# Financial news endpoint
@api_view(['GET'])
def financial_news(request):
    url = "https://newsdata.io/api/1/news"
    params = {
        'apikey': settings.NEWS_API_KEY,
        'category': 'business',
        'language': 'en',
        'country': 'us'
    }
    try:
        r = requests.get(url, params=params)
        r.raise_for_status()
        articles = r.json().get('results', [])[:5]
        return Response(articles)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Buy stock (add to portfolio)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_stock(request):
    serializer = PortfolioItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Sell stock (update portfolio)
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def sell_stock(request, pk):
    try:
        item = PortfolioItem.objects.get(pk=pk, user=request.user)
    except PortfolioItem.DoesNotExist:
        return Response({'error': 'Position not found'}, status=404)

    sell_price = request.data.get('sell_price')
    if sell_price:
        item.sell_price = sell_price
        item.is_closed = True
        item.save()
        return Response(PortfolioItemSerializer(item).data)

    return Response({'error': 'sell_price is required'}, status=400)

# View portfolio
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_portfolio(request):
    items = PortfolioItem.objects.filter(user=request.user)
    return Response(PortfolioItemSerializer(items, many=True).data)

# Risk calculator
class RiskCalculationListCreateView(generics.ListCreateAPIView):
    serializer_class = RiskCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RiskCalculation.objects.filter(user=self.request.user).order_by('-date_created')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Intraday price + trend (for a given stock symbol)
@api_view(['GET'])
def intraday_trend_view(request, symbol):
    """
    Get the intraday price trend for a given stock symbol.
    """
    if not symbol:
        return Response({'error': 'Symbol is required'}, status=400)
    # Additional implementation to fetch intraday trend
