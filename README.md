# 🚀 FinPredict Pro

**FinPredict Pro** is a state-of-the-art AI-powered market intelligence and predictive analysis platform for Indian and Global stocks. It uses advanced machine learning models (LSTM, XGBoost) to forecast stock price trends, combined with a beautiful, modern React frontend.

## ✨ Features
* **Real-time Stock Data & Analytics**: Integrates live stock market data via API.
* **AI Machine Learning Predictions**: Employs LSTM and XGBoost models running on a Python/FastAPI backend to forecast 30-day stock movements.
* **Corporate Events Calendar**: Automatic tracking of dividend announcements, stock splits, and earnings calls based on your watchlist.
* **User Authentication**: Secure JWT-based authentication system.
* **Personalized Watchlist**: Seamlessly track your favorite stocks.
* **Responsive Dashboard UI**: A premium, dark-mode focused glassmorphic user interface built with React, Vite, and Tailwind CSS.

## 🏗️ Architecture
* **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
* **Backend**: FastAPI (Python), SQLAlchemy, Passlib (JWT Auth)
* **Database**: PostgreSQL (Production) / SQLite (Local Development)
* **Machine Learning**: Scikit-Learn, TensorFlow/Keras, Pandas, NumPy

---

## 🚀 Local Development Setup

### 1. Backend Setup (FastAPI)
The backend is located in the `fintech-backend` directory.

```bash
cd fintech-backend
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on port 8000)
uvicorn app.main:app --reload
```

### 2. Frontend Setup (React/Vite)
The frontend relies on the backend API running at `http://localhost:8000`.

```bash
# In the root directory:
npm install

# Start the Vite development server (runs on port 8080)
npm run dev
```

Visit `http://localhost:8080` in your browser. You can register a new account or use the default test credentials.

---

## 🌐 Production Deployment (Railway & Vercel)

This project is configured for full-stack production deployment.

### Backend Deployment (Railway)
1. Fork or push this repository to your GitHub account.
2. Sign in to [Railway](https://railway.app/).
3. Create a **New Project** -> **Deploy from GitHub repo**.
4. Select this repository. Railway will automatically detect the `Dockerfile` inside `fintech-backend` and build the Python service.
5. **Add a PostgreSQL Database** to your Railway project.
6. Set the `DATABASE_URL` environment variable in your Backend service to the connection string provided by the Railway PostgreSQL database.

### Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com/).
2. Create a **New Project** and import this repository.
3. Vercel will automatically detect the Vite React framework.
4. Go to Environment Variables and add `VITE_API_URL` pointing to your Railway backend's public domain (e.g., `https://finpredict-backend-production.up.railway.app/api/v1`).
5. Deploy!

---

## 📚 Documentation
Legacy planning and architectural guides are available in the `docs/` folder:
* `fintech_complete_guide.md`
* `fintech_quickstart.md`
* `fintech_code_snippets.md`
* `fintech_analysis.md`

## 👨‍💻 Author
Created by Sai Annirudh
