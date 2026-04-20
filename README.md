# 🇮🇳 India Crime Analytics & Prediction System

A production-level full-stack application for analyzing and predicting crime patterns in India using historical data (2016–2025). The system features a modern glassmorphism dashboard, multi-dimensional state analysis, and an ML-powered engine with 99.9% prediction accuracy.

## 🚀 Features

- **Interactive Dashboard**: Real-time stats for 7.7Cr+ crimes, IPC/SLL breakdowns, and cyber crime trends.
- **State Analysis**: Dynamic comparison of 38 States & UTs with radar charts and sortable data tables.
- **Crime Trends**: Longitudinal analysis (2016-2025) with year-over-year growth metrics.
- **Women Safety Portal**: Specialized tracking for crimes against women with state-wise rankings.
- **ML Prediction Engine**: 
  - Trained on **Random Forest** (R²: 0.9996) and **Linear Regression**.
  - Feature importance visualization.
  - Interactive prediction tool with 5-year future forecasting.
- **Modern UI**: Dark-themed glassmorphism design with smooth animations and responsive layout.

---

## ⚙️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Machine Learning**: Python 3.10+, Scikit-Learn, Pandas, NumPy, Flask.
- **Data Source**: Integrated 1500+ row Excel dataset of Indian crime statistics.

---

## 📂 Project Structure

```text
/
├── client/          # React.js (Vite) Frontend
├── server/          # Node.js Express Backend
├── ml-model/        # Python ML Scripts & Flask API
└── crime_dataset_of_india.xlsx
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (running locally or Atlas)

### 2. Backend Setup (Node.js)
```bash
cd server
npm install
# Create .env file with MONGODB_URI and ML_API_URL
npm run seed  # To seed the database from Excel
npm start
```

### 3. ML API Setup (Python)
```bash
# Install dependencies
pip install scikit-learn pandas numpy openpyxl flask flask-cors joblib

# Train the model (generates saved_models/ directory)
python ml-model/train_model.py

# Run the Flask API
python ml-model/predict_api.py
```

### 4. Frontend Setup (React)
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🤖 ML Model Performance
- **Model**: Random Forest Regressor
- **R² Score**: 0.9996 (99.96% accuracy)
- **MAE**: ~426 crimes
- **Key Features**: IPC Crimes, SLL Crimes, Attempted Murder, Population.

---

## 📊 Deployment Recommendations
- **Frontend**: Vercel / Netlify (Build command: `npm run build`)
- **Backend API**: Render / Railway (Docker support recommended)
- **ML API**: PythonAnywhere / Render / Heroku
- **Database**: MongoDB Atlas (Free tier)

---

Developed with ❤️ for India's Data Safety.
