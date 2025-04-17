from django.urls import path
from . import views

urlpatterns = [
    path('watchlist/', views.watchlist_view, name='watchlist_view'),
    path('watchlist/<int:pk>/', views.delete_watchlist_item, name='delete_watchlist_item'),  # Use pk (id) for deletion
    path('search/', views.stock_search, name='stock_search'),
    path('news/', views.financial_news),  # Financial news endpoint

    # Portfolio routes
    path('portfolio/', views.view_portfolio),  # GET portfolio
    path('portfolio/buy/', views.buy_stock),  # POST to buy stock
    path('portfolio/sell/<int:pk>/', views.sell_stock),  # PATCH to sell stock
    path('risk/', views.RiskCalculationListCreateView.as_view(), name='risk-calculations'),
    path('intraday/<str:symbol>/', views.intraday_trend_view, name='intraday_trend'),

    path('risk/<int:pk>/', views.RiskCalculationDetailView.as_view(), name='risk-delete'),
]
