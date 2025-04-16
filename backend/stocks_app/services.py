from django.conf import settings
import requests

def fetch_stock_data(symbol):
    url = 'https://www.alphavantage.co/query'
    params = {
        'function': 'GLOBAL_QUOTE',
        'symbol': symbol,
        'apikey': settings.ALPHA_VANTAGE_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

def fetch_intraday_data(symbol):
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={API_KEY}'
    response = requests.get(url)
    return response.json()
