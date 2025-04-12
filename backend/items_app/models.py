from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=100)
    ticker = models.CharField(max_length=10, unique=True)  # e.g., AAPL
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.ticker})"
