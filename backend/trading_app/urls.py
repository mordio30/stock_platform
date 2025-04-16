from django.urls import path
from .views import TradeListCreateView, TradeDetailView, SellTradeView

urlpatterns = [
    path('', TradeListCreateView.as_view(), name='trade-list-create'),               # GET and POST /api/trades/
    path('<int:pk>/', TradeDetailView.as_view(), name='trade-detail'),               # DELETE /api/trades/<id>/
    path('sell/<int:pk>/', SellTradeView.as_view(), name='sell-trade'),              # PATCH /api/trades/sell/<id>/
]
