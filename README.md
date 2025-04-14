# 📊 StockCompanion

**StockCompanion** is a full-stack stock market analysis and simulation platform. It helps users **search stocks**, **track watchlists**, **simulate trades**, **calculate risk/reward**, and **stay updated with financial news** — all in one sleek dashboard.

---

## 🚀 Features

- 🔐 **User Authentication** with JWT (login + registration)
- 🔎 **Live Stock Search** via Alpha Vantage API
- 📈 **Portfolio Management** with simulated buy trades and dynamic charts
- ⭐ **Personal Watchlist** (no duplicates, user-specific)
- ⚖️ **Risk Calculator** to analyze trade setups (with backend logging)
- 🗞️ **Latest Financial News Feed** from NewsAPI.io
- 📊 **Interactive Charts** using Recharts
- ✅ **Token-protected API endpoints** with Django REST Framework
- 🎨 **Responsive UI** using Bootstrap & React-Bootstrap
- 🛠️ Backend: Django + PostgreSQL | Frontend: React

---

## 📷 Screenshots

> _Add a few screenshots of the Home page, Stock Search, Watchlist, and Portfolio page here._

---

## 🧰 Tech Stack

| Frontend | Backend | Database | APIs |
|----------|---------|----------|------|
| React    | Django REST Framework | PostgreSQL | Alpha Vantage, NewsAPI.io |

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/stockcompanion.git
cd stockcompanion


Backend Setup

cd backend  
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend Setup

cd frontend  
npm install
npm start

API Endpoints (Sample)

Endpoint	                Method	Description
/api/token/	                POST	Get JWT token
/api/stocks/search/	        GET	Search stock symbol
/api/stocks/watchlist/	    GET/POST	Manage watchlist
/api/stocks/portfolio/	    GET/POST	Simulate trades
/api/stocks/risk/	        GET/POST	Save/view risk calculations
/api/stocks/news/	        GET	Fetch financial news

Credits
Stock data: Alpha Vantage

Financial News: NewsAPI.io

Charts: Recharts

Auth: Django REST Framework JWT