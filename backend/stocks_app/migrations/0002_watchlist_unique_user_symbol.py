# Generated by Django 5.2 on 2025-04-11 17:42

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stocks_app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='watchlist',
            constraint=models.UniqueConstraint(fields=('user', 'symbol'), name='unique_user_symbol'),
        ),
    ]
