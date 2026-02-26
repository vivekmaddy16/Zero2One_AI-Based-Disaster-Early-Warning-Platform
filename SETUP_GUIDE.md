# 🚀 Complete Setup Guide

## Quick Start (2 Minutes)

### 1. **Start Backend Server**
```bash
cd backend
npm install
npm start
```
Backend runs on: `http://localhost:5000`

### 2. **Open Frontend** (in another terminal)
```bash
# From project root
open index.html
# or simply open the file in your browser
```

---

## What's Included?

### ✅ **Frontend**
- [index.html](index.html) - UI Design
- [script.js](script.js) - Frontend Logic with Backend Integration
- [styles.css](styles.css) - Styling

### ✅ **Backend**
- Express.js REST API
- OpenWeatherMap Integration
- Disaster Prediction Engine
- Alert Management System
- Real-time Data Updates

---

## API Endpoints

### Weather API
```bash
GET http://localhost:5000/api/weather/location/{lat}/{lon}
GET http://localhost:5000/api/weather/city/{cityName}
GET http://localhost:5000/api/weather/forecast/{lat}/{lon}
```

### Alerts API
```bash
GET    http://localhost:5000/api/alerts
POST   http://localhost:5000/api/alerts
PUT    http://localhost:5000/api/alerts/{id}
DELETE http://localhost:5000/api/alerts/{id}
```

### Disaster Predictions
```bash
GET http://localhost:5000/api/disasters/predict/{lat}/{lon}
GET http://localhost:5000/api/disasters/risk/{lat}/{lon}
```

---

## Configuration

### Frontend Settings
In `script.js`, line 7:
```javascript
const USE_BACKEND = true;  // Enable backend integration
const BACKEND_URL = 'http://localhost:5000/api';
```

### Backend Settings
In `backend/.env`:
```
PORT=5000
WEATHER_API_KEY=ac8d14aaa4f32a0ea5af08e2b7933478
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

---

## Testing the Integration

### Test 1: Fetch Weather
```bash
curl http://localhost:5000/api/weather/location/28.7041/77.1025
```

### Test 2: Get Predictions
```bash
curl http://localhost:5000/api/disasters/predict/28.7041/77.1025
```

### Test 3: Create Alert
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "flood",
    "severity": "high",
    "location": "New Delhi",
    "message": "Flood warning"
  }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend not responding | Check if port 5000 is free: `lsof -i :5000` |
| CORS errors | Update `CORS_ORIGIN` in `.env` |
| OpenWeatherMap API not working | Verify API key, check internet connection |
| Port 5000 in use | Change `PORT` in `.env` to another port |

---

## 📁 Project Structure

```
.
├── index.html                    # Main UI
├── script.js                     # Frontend + Backend Integration
├── styles.css                    # Styling
├── README.md                     # Main README
├── BACKEND_SETUP.md             # Backend Documentation
│
└── backend/
    ├── server.js                # Express Server
    ├── package.json             # Dependencies
    ├── .env                     # Configuration
    ├── README.md                # API Documentation
    │
    ├── routes/                  # API Routes
    │   ├── health.js
    │   ├── weather.js
    │   ├── alerts.js
    │   └── disasters.js
    │
    ├── controllers/             # Business Logic
    │   ├── weatherController.js
    │   ├── alertController.js
    │   └── disasterController.js
    │
    ├── data/                    # Data Storage
    │   └── alerts.json
    │
    └── utils/                   # Utilities
```

---

## Features

✨ **Real-time Weather Data**
- Live OpenWeatherMap integration
- Fallback to direct API calls

🎯 **AI-Powered Predictions**
- Flood risk analysis
- Cyclone detection
- Heatwave warnings
- Earthquake monitoring

🚨 **Alert Management**
- Create, update, delete alerts
- Filter by type and severity
- Real-time notifications

📊 **Risk Assessment**
- Multi-factor analysis
- Location-based predictions
- Historical data tracking

---

## Next Steps

1. ✅ Backend is ready to use
2. ✅ Frontend integration is complete
3. 📝 Check [backend/README.md](backend/README.md) for detailed API docs
4. 🔌 Connect to database (MongoDB support in backend/controllers)
5. 🚀 Deploy to production

---

## Support

For issues or questions, check:
- [backend/README.md](backend/README.md) - Backend documentation
- [BACKEND_SETUP.md](BACKEND_SETUP.md) - Setup troubleshooting

Happy coding! 🎉
