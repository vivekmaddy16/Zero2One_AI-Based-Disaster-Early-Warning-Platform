# 🚀 How to Run the Disaster Early Warning Platform

## Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## ⚡ Option 1: Run Backend & Frontend (Complete Setup)

### Terminal 1 - Start Backend Server

```bash
cd backend
npm install
npm start
```

**Expected Output:**
```
🚀 Server running on http://localhost:5000
📡 Environment: development
```

The backend will be running on `http://localhost:5000`

---

### Terminal 2 - Open Frontend in Browser

```bash
# Navigate to frontend folder
cd frontend

# Open index.html in your default browser
# On macOS:
open index.html

# On Linux:
xdg-open index.html

# On Windows:
start index.html
```

Or simply open the file directly:
- Find `/frontend/index.html` in file explorer
- Right-click → Open with Browser

**Frontend will run on:** `file:///your-path/frontend/index.html`

---

## 🎯 Option 2: Quick Development Setup (Recommended)

### Terminal 1 - Backend
```bash
cd backend && npm install && npm start
```

### Terminal 2 - Frontend (Using Python Simple Server)
```bash
cd frontend
# Python 3
python -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

Then open: `http://localhost:8000`

---

## 🔧 Option 3: Using Node.js Simple Server for Frontend

### Terminal 1 - Backend
```bash
cd backend && npm install && npm start
```

### Terminal 2 - Frontend with Node Server
```bash
cd frontend
npx http-server -p 8000
```

Then open: `http://localhost:8000`

---

## 📋 Complete Commands (Copy & Paste)

### Setup Everything
```bash
# Install backend dependencies
cd backend
npm install

# Keep backend running
npm start
```

In a **new terminal**:
```bash
# Open frontend folder and start server
cd frontend
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

---

## 🌐 Access Points

| Component | URL |
|-----------|-----|
| **Frontend** | `http://localhost:8000` |
| **Backend API** | `http://localhost:5000/api` |
| **Health Check** | `http://localhost:5000/api/health` |

---

## 🧪 Test Backend APIs (After Starting Backend)

### Check Backend is Running
```bash
curl http://localhost:5000/api/health
```

### Get Weather Data
```bash
curl http://localhost:5000/api/weather/location/28.7041/77.1025
```

### Get All Alerts
```bash
curl http://localhost:5000/api/alerts
```

---

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is in use, change in `backend/.env`:
```
PORT=5001
```

Then start: `npm start`

### CORS Issues
Frontend might not connect to backend on different domains. Update `backend/.env`:
```
CORS_ORIGIN=http://localhost:8000,http://localhost:3000
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
npm start
```

---

## 📱 Features to Test

✅ **Real-time Map** - See 6 disaster zones with blinking markers
✅ **Weather Integration** - Click "Refresh Weather" to see real data
✅ **Live Monitoring** - Click "Live Monitoring" button
✅ **Map Layers** - Toggle between Street, Satellite, Terrain, Dark modes
✅ **Search** - Search for locations on the map
✅ **Alerts** - Create and manage disaster alerts

---

## 🎬 Full Startup Example

```bash
# Step 1: Terminal 1 - Start Backend
cd backend
npm install
npm start

# Step 2: Terminal 2 - Start Frontend Server
cd frontend
npx http-server -p 8000

# Step 3: Open Browser
# Visit: http://localhost:8000
```

---

## 📝 Development Notes

- **Backend:** Express.js on port 5000
- **Frontend:** Static files, can run on any port
- **API Base URL:** `http://localhost:5000/api`
- **Data Storage:** JSON files in `backend/data/`

---

## 🚀 Environment Variables

Check `backend/.env` for configuration:
```
PORT=5000
WEATHER_API_KEY=ac8d14aaa4f32a0ea5af08e2b7933478
CORS_ORIGIN=http://localhost:8000
```

---

Enjoy using the Disaster Early Warning Platform! 🎉
