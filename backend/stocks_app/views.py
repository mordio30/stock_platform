import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, permissions
from .models import Watchlist
from .models import PortfolioItem
from .models import RiskCalculation
from .serializers import RiskCalculationSerializer
from .serializers import WatchlistSerializer
from .serializers import PortfolioItemSerializer
from .services import fetch_stock_data  # Importing your fetch_stock_data function

# 🔎 Stock search (public)
@api_view(['GET'])
def stock_search(request):
    symbol = request.GET.get('symbol', '').upper()
    if not symbol:
        return Response({'error': 'Symbol is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch stock data using the service
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

    elif '01. symbol' in data:  # fallback if not using Global Quote
        cleaned = {
            'symbol': data.get('01. symbol'),
            'price': data.get('05. price'),
            'open': data.get('02. open'),
            'high': data.get('03. high'),
            'low': data.get('04. low'),
            'volume': data.get('06. volume'),
            'latest_trading_day': data.get('07. latest trading day'),
            'previous_close': data.get('08. previous close'),
            'change': data.get('09. change'),
            'change_percent': data.get('10. change percent'),
        }
        return Response(cleaned)

    elif 'Note' in data:
        return Response({'error': 'API rate limit exceeded'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    elif 'Error Message' in data or not data:
        return Response({'error': 'Stock not found or invalid symbol'}, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({'error': 'Unexpected response from API'}, status=status.HTTP_502_BAD_GATEWAY)


# ✅ Watchlist GET/POST (authenticated)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def watchlist_view(request):
    if request.method == 'GET':
        watchlist = Watchlist.objects.filter(user=request.user)
        serializer = WatchlistSerializer(watchlist, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = WatchlistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 🗑️ Delete from watchlist (authenticated)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_watchlist_item(request, symbol):
    symbol = symbol.upper()  # Normalize
    item = Watchlist.objects.filter(user=request.user, symbol=symbol).first()

    if item:
        item.delete()
        return Response({'message': f'{symbol} removed from watchlist.'}, status=200)
    else:
        return Response({'error': 'Item not found in your watchlist.'}, status=404)
    
# news API view
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
        data = r.json()
        articles = data.get('results', [])[:5]  # limit to 5 articles
        return Response(articles)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# 📥 Buy stock (add to portfolio)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def buy_stock(request):
    serializer = PortfolioItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# 📤 Sell stock (mark position as closed)
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
        serializer = PortfolioItemSerializer(item)
        return Response(serializer.data)

    return Response({'error': 'sell_price is required'}, status=400)

# 📊 View portfolio (GET)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_portfolio(request):
    items = PortfolioItem.objects.filter(user=request.user)
    serializer = PortfolioItemSerializer(items, many=True)
    return Response(serializer.data)

class RiskCalculationListCreateView(generics.ListCreateAPIView):
    serializer_class = RiskCalculationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RiskCalculation.objects.filter(user=self.request.user).order_by('-date_created')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)