from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlist')
    symbol = models.CharField(max_length=10)
    added_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.symbol = self.symbol.upper()  # Automatically make the symbol uppercase
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'symbol'], name='unique_user_symbol')
        ]

    def __str__(self):
        return f"{self.symbol} - {self.user.username}"


