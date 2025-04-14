from django.urls import path
from . import views

urlpatterns = [
    path('watchlist/', views.watchlist_view, name='watchlist_view'),  # To view and add to the watchlist
    path('watchlist/<str:symbol>/', views.delete_watchlist_item, name='delete_watchlist_item'),  # To remove a stock from the watchlist
    path('search/', views.stock_search, name='stock_search'),
    path('news/', views.financial_news),  # 👈 Add this

    # New portfolio routes
    path('portfolio/', views.view_portfolio),          # GET
    path('portfolio/buy/', views.buy_stock),           # POST
    path('portfolio/sell/<int:pk>/', views.sell_stock), # PATCH
    path('risk/', views.RiskCalculationListCreateView.as_view(), name='risk-calculations'),
]
