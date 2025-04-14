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


class PortfolioItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    shares = models.PositiveIntegerField()
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stop_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    target_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_closed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.symbol} - {self.shares} shares"

    def current_value(self):
        if self.sell_price:
            return self.sell_price * self.shares
        return None

    def profit_loss(self):
        if self.sell_price:
            return (self.sell_price - self.buy_price) * self.shares
        return None

class RiskCalculation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_calculations')
    symbol = models.CharField(max_length=10)
    buy_price = models.DecimalField(max_digits=10, decimal_places=2)
    stop_loss = models.DecimalField(max_digits=10, decimal_places=2)
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    risk_per_share = models.DecimalField(max_digits=10, decimal_places=2)
    reward_per_share = models.DecimalField(max_digits=10, decimal_places=2)
    risk_reward_ratio = models.DecimalField(max_digits=10, decimal_places=2)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.symbol} - {self.user.username} - {self.date_created.strftime('%Y-%m-%d')}"