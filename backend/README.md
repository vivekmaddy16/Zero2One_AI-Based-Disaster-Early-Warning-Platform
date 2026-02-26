# Backend API Documentation

## Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file (already created with defaults)**
Update the `.env` file with your configuration:
```
PORT=5000
NODE_ENV=development
WEATHER_API_KEY=ac8d14aaa4f32a0ea5af08e2b7933478
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

4. **Start the server:**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns server status and uptime

### Weather API

#### Get Weather by Coordinates
- **GET** `/api/weather/location/:lat/:lon`
  - Parameters: `lat`, `lon`
  - Returns current weather data

Example:
```
GET http://localhost:5000/api/weather/location/28.7041/77.1025
```

#### Get Weather by City Name
- **GET** `/api/weather/city/:cityName`
  - Parameters: `cityName`
  - Returns current weather for the city

Example:
```
GET http://localhost:5000/api/weather/city/Delhi
```

#### Get Weather Forecast
- **GET** `/api/weather/forecast/:lat/:lon`
  - Parameters: `lat`, `lon`
  - Returns 5-day weather forecast

#### Get All Cached Weather Data
- **GET** `/api/weather/all`
  - Returns all cached weather data

---

### Alerts API

#### Get All Alerts
- **GET** `/api/alerts`
  - Returns all alerts

#### Get Alert by ID
- **GET** `/api/alerts/:id`
  - Returns specific alert

#### Create New Alert
- **POST** `/api/alerts`
  - Body:
    ```json
    {
      "type": "flood",
      "severity": "high",
      "location": "New Delhi",
      "message": "Flash flood warning",
      "coordinates": {
        "lat": 28.7041,
        "lon": 77.1025
      }
    }
    ```

#### Update Alert
- **PUT** `/api/alerts/:id`
  - Update alert details

#### Delete Alert
- **DELETE** `/api/alerts/:id`
  - Delete specific alert

#### Get Alerts by Type
- **GET** `/api/alerts/type/:type`
  - Get alerts of specific type (flood, cyclone, etc.)

#### Get Active Alerts
- **GET** `/api/alerts/status/active`
  - Get all active alerts

---

### Disaster Prediction API

#### Predict Disasters
- **GET** `/api/disasters/predict/:lat/:lon`
  - Parameters: `lat`, `lon`
  - Returns disaster predictions based on weather data

Example:
```
GET http://localhost:5000/api/disasters/predict/28.7041/77.1025
```

#### Get Risk Assessment
- **GET** `/api/disasters/risk/:lat/:lon`
  - Parameters: `lat`, `lon`
  - Returns risk levels for various disaster types

#### Get All Disaster Types
- **GET** `/api/disasters`
  - Returns all supported disaster types

#### Get Disaster by Type
- **GET** `/api/disasters/type/:type`
  - Get information about specific disaster type

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Frontend Integration

Update your frontend script to use the backend:

```javascript
const BACKEND_URL = 'http://localhost:5000/api';

// Fetch weather from backend
async function fetchWeatherFromBackend(lat, lon) {
    const response = await fetch(`${BACKEND_URL}/weather/location/${lat}/${lon}`);
    const data = await response.json();
    return data.data;
}

// Get disaster predictions
async function getPredictions(lat, lon) {
    const response = await fetch(`${BACKEND_URL}/disasters/predict/${lat}/${lon}`);
    const data = await response.json();
    return data.predictions;
}

// Create alert
async function createAlert(type, severity, location, message) {
    const response = await fetch(`${BACKEND_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, severity, location, message })
    });
    return await response.json();
}
```

---

## Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── routes/
│   ├── health.js         # Health check routes
│   ├── weather.js        # Weather API routes
│   ├── alerts.js         # Alerts API routes
│   └── disasters.js      # Disaster prediction routes
├── controllers/
│   ├── weatherController.js
│   ├── alertController.js
│   └── disasterController.js
├── data/
│   └── alerts.json       # Alert storage
└── utils/
    └── [utility functions]
```

---

## Features

✅ Real-time weather data via OpenWeatherMap API  
✅ Disaster prediction based on weather patterns  
✅ Alert management system  
✅ Risk assessment calculations  
✅ Weather forecast integration  
✅ Caching mechanism for better performance  
✅ CORS support for frontend integration  
✅ Error handling and logging  

---

## Development

For development mode with auto-reload:
```bash
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| NODE_ENV | Environment (development/production) |
| WEATHER_API_KEY | OpenWeatherMap API key |
| WEATHER_API_URL | OpenWeatherMap API endpoint |
| CORS_ORIGIN | Allowed origins for CORS |
| UPDATE_INTERVAL | Data update interval in ms |
| ALERT_THRESHOLD | Alert threshold percentage |
