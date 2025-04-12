from django.urls import path
from . import views

urlpatterns = [
    path('watchlist/', views.watchlist_view, name='watchlist_view'),  # To view and add to the watchlist
    path('watchlist/<str:symbol>/', views.delete_watchlist_item, name='delete_watchlist_item'),  # To remove a stock from the watchlist
    path('search/', views.stock_search, name='stock_search'),

]
