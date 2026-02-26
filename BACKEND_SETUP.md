# Backend Setup & Installation Guide

## Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Server
```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 3: Verify Server is Running
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "Disaster Early Warning System - Backend Running",
  "timestamp": "2026-02-26T...",
  "uptime": ...
}
```

---

## API Examples

### Get Weather Data
```bash
curl http://localhost:5000/api/weather/location/28.7041/77.1025
```

### Get Disaster Predictions
```bash
curl http://localhost:5000/api/disasters/predict/28.7041/77.1025
```

### Create an Alert
```bash
curl -X POST http://localhost:5000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "flood",
    "severity": "high",
    "location": "New Delhi",
    "message": "Flash flood warning in north Delhi"
  }'
```

### Get Active Alerts
```bash
curl http://localhost:5000/api/alerts/status/active
```

---

## Frontend Configuration

Update `script.js` to use the backend:

```javascript
// Add this at the top of script.js
const BACKEND_URL = 'http://localhost:5000/api';

// Modify the fetchWeatherFromOpenWeatherMap function:
function fetchWeatherFromBackend(lat, lon) {
    const url = `${BACKEND_URL}/weather/location/${lat}/${lon}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateWeatherData(data.data);
                document.getElementById('refreshWeather').classList.remove('fa-spin');
                showNotification('Weather data updated successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('refreshWeather').classList.remove('fa-spin');
            showNotification('Failed to fetch weather data', 'error');
        });
}
```

---

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `.env`:
```
PORT=5001
```

### CORS Errors
Ensure your `.env` has correct CORS origins:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
```

### OpenWeatherMap API Not Working
- Verify your API key in `.env`
- Check if you have internet connection
- Ensure API key has proper permissions

---

See `README.md` in this directory for detailed API documentation.
