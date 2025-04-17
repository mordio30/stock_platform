from django.urls import path
from .views import register, login, current_user, DeleteUserView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('user/', current_user),
    path('delete/', DeleteUserView.as_view(), name='delete-user'),
]
