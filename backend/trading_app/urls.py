from django.urls import path
from .views import TradeCreateView, TradeDetailView

urlpatterns = [
    path('trades/', TradeCreateView.as_view(), name='trade-list-create'),
    path('trades/<int:pk>/', TradeDetailView.as_view(), name='trade-delete'),
]
