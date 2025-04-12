import requests

API_KEY = 'S4ZNHAGPIWOERCF3'  # Replace with your real key

def fetch_stock_data(symbol):
    url = 'https://www.alphavantage.co/query'
    params = {
        'function': 'GLOBAL_QUOTE',  # Changed to GLOBAL_QUOTE for real-time price data
        'symbol': symbol,
        'apikey': API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()  # Returns the data as JSON for further use

