from django.urls import path
from .views import register, login, current_user

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('user/', current_user),
]
