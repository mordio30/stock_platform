from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from users_app.models import User  # import your custom User model

admin.site.register(User, UserAdmin)
