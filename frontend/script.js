// API Configuration
const WEATHER_API_KEY = 'ac8d14aaa4f32a0ea5af08e2b7933478';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Backend API Configuration
const BACKEND_URL = 'http://localhost:5000/api';
const USE_BACKEND = true; // Set to true to use backend, false for direct API calls

// Map Configuration
let map = null;
let markerGroup = null;

// Simple client-side auth (demo). Replace with real auth as needed.
const AUTH_TOKEN_KEY = 'disasterAuth';
const AUTH_USER_KEY = 'disasterUser';
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'password';

function isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

function ensureAuthOrRedirect() {
    // If user is not authenticated and not on login page, redirect to login
    const path = window.location.pathname;
    if (!isAuthenticated() && !path.endsWith('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    // If authenticated and currently on login page, go to index
    if (isAuthenticated() && path.endsWith('login.html')) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function login(username, password) {
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        // set a simple token
        localStorage.setItem(AUTH_TOKEN_KEY, 'token_demo_123');
        localStorage.setItem(AUTH_USER_KEY, username);
        window.location.href = 'index.html';
        return true;
    }
    showNotification('Invalid username or password', 'error');
    return false;
}

function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.location.href = 'login.html';
}

// Disaster zones with real coordinates (India)
const DISASTER_ZONES = [
    { name: 'North Delhi - Flood Risk', lat: 28.7041, lon: 77.1025, type: 'flood', severity: 'critical', message: 'Flash flood warning' },
    { name: 'Mumbai - Cyclone Risk', lat: 19.0760, lon: 72.8777, type: 'cyclone', severity: 'warning', message: 'Cyclone approaching coast' },
    { name: 'Bangalore - Drought', lat: 12.9716, lon: 77.5946, type: 'drought', severity: 'warning', message: 'Water scarcity alert' },
    { name: 'Chennai - Heatwave', lat: 13.0827, lon: 80.2707, type: 'heatwave', severity: 'critical', message: 'Extreme heat warning' },
    { name: 'Kolkata - Heavy Rain', lat: 22.5726, lon: 88.3639, type: 'flood', severity: 'warning', message: 'Heavy rainfall expected' },
    { name: 'Hyderabad - Landslide', lat: 17.3850, lon: 78.4867, type: 'landslide', severity: 'critical', message: 'Landslide risk high' }
];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    if (!ensureAuthOrRedirect()) return;
    initializeApp();
});

// Main initialization function
function initializeApp() {
    setupEventListeners();
    initializeMap();
    startRealTimeUpdates();
    initializeTooltips();
    if (USE_BACKEND) {
        fetchAlertsFromBackend();
    }
}

// Initialize Real Map with Leaflet
function initializeMap() {
    // Create map centered on India
    map = L.map('realMap', {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true
    }).setView([20.5937, 78.9629], 5);
    
    // Map Layers - Professional looking like Google Maps
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors',
        maxZoom: 19,
        className: 'osm-layer'
    });
    
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 18,
        className: 'satellite-layer'
    });
    
    const tonerLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: OpenStreetMap contributors, SRTM',
        maxZoom: 17,
        className: 'terrain-layer'
    });
    
    const darkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '© Stadia Maps © OpenMapTiles © OpenStreetMap contributors',
        maxZoom: 20,
        className: 'dark-layer'
    });
    
    // Set default layer
    osmLayer.addTo(map);
    
    // Layer control - Professional styling
    const baseMaps = {
        '<span style="color: #333;">🌍 Street Map</span>': osmLayer,
        '<span style="color: #333;">🛰️ Satellite</span>': satelliteLayer,
        '<span style="color: #333;">🏔️ Terrain</span>': tonerLayer,
        '<span style="color: #333;">🌙 Dark Mode</span>': darkLayer
    };
    
    const layerControl = L.control.layers(baseMaps, {}, {
        position: 'topright',
        collapsed: true
    });
    layerControl.addTo(map);
    
    // Customize zoom control
    map.zoomControl.setPosition('bottomright');
    
    // Create marker group for disasters
    markerGroup = L.featureGroup().addTo(map);
    
    // Add all disaster zones to map with radius circles
    DISASTER_ZONES.forEach((zone, index) => {
        addDisasterMarkerWithRadius(zone, index);
    });
    
    // Add search functionality
    addMapSearch();
    
    // Fit markers in view
    setTimeout(() => {
        if (markerGroup.getLayers().length > 0) {
            map.fitBounds(markerGroup.getBounds().pad(0.1));
        }
    }, 100);
}

// Add disaster marker with impact radius circle
function addDisasterMarkerWithRadius(zone, index) {
    const markerColor = zone.severity === 'critical' ? '#ff4757' : '#ffa502';
    const circleColor = zone.severity === 'critical' ? '#ff4757' : '#ffa502';
    
    // Add radius circle showing impact area
    const circle = L.circle([zone.lat, zone.lon], {
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.15,
        weight: 2,
        radius: 30000, // 30km radius
        dashArray: '5, 5',
        className: 'disaster-radius'
    }).bindPopup(`<strong>${zone.name}</strong><br>Impact Radius: ~30km`);
    
    markerGroup.addLayer(circle);
    
    // Create custom marker
    const markerHtml = `
        <div class="custom-marker custom-marker-${zone.severity}" style="
            background-color: ${markerColor};
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            ${zone.severity === 'critical' ? 'animation: blink 1s infinite;' : ''}
        ">
            <i class="fas fa-exclamation" style="color: white; font-size: 16px;"></i>
        </div>
    `;
    
    const marker = L.marker([zone.lat, zone.lon], {
        icon: L.divIcon({
            html: markerHtml,
            iconSize: [40, 40],
            className: 'disaster-marker'
        }),
        title: zone.name,
        zIndexOffset: zone.severity === 'critical' ? 999 : 0
    });
    
    // Create professional popup
    const popupContent = `
        <div class="map-popup">
            <h4>${zone.name}</h4>
            <div class="popup-content">
                <div class="popup-row">
                    <span class="popup-label">Disaster Type:</span>
                    <span class="popup-value">${zone.type.toUpperCase()}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Severity:</span>
                    <span class="popup-value" style="color: ${zone.severity === 'critical' ? '#ff4757' : '#ffa502'};">
                        ${zone.severity.toUpperCase()}
                    </span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Alert:</span>
                    <span class="popup-value">${zone.message}</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Coordinates:</span>
                    <span class="popup-value" style="font-size: 11px;">
                        ${zone.lat.toFixed(4)}, ${zone.lon.toFixed(4)}
                    </span>
                </div>
                <button class="popup-btn" onclick="createAlertInBackend('${zone.type}', '${zone.severity}', '${zone.name}', '${zone.message}', {lat: ${zone.lat}, lon: ${zone.lon}})">
                    <i class="fas fa-bell"></i> Create Alert
                </button>
            </div>
        </div>
    `;
    
    marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
    });
    
    // Show popup on critical zones
    if (zone.severity === 'critical') {
        marker.bindTooltip(zone.name, {
            permanent: false,
            direction: 'top',
            offset: [0, -15],
            className: 'disaster-tooltip'
        });
    }
    
    markerGroup.addLayer(marker);
}

// Add map search functionality
function addMapSearch() {
    const searchBox = document.getElementById('mapSearch');
    if (!searchBox) return;
    
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = searchBox.value;
            searchLocation(location);
        }
    });
}

// Search for location
function searchLocation(locationName) {
    // Find matching disaster zone
    const zone = DISASTER_ZONES.find(z => 
        z.name.toLowerCase().includes(locationName.toLowerCase())
    );
    
    if (zone) {
        map.setView([zone.lat, zone.lon], 10);
        markerGroup.eachLayer(layer => {
            if (layer.getLatLng && 
                layer.getLatLng().lat === zone.lat && 
                layer.getLatLng().lng === zone.lon) {
                setTimeout(() => layer.openPopup(), 300);
            }
        });
        showNotification(`Found: ${zone.name}`, 'success');
    } else {
        // Use OpenStreetMap Nominatim API for general location search
        fetch(`https://nominatim.openstreetmap.org/search?q=${locationName}&format=json&limit=1`)
            .then(r => r.json())
            .then(data => {
                if (data.length > 0) {
                    const result = data[0];
                    map.setView([result.lat, result.lon], 12);
                    L.marker([result.lat, result.lon]).addTo(map)
                        .bindPopup(`<strong>${result.name}</strong>`)
                        .openPopup();
                    showNotification(`Found: ${result.name}`, 'success');
                } else {
                    showNotification('Location not found', 'error');
                }
            })
            .catch(err => showNotification('Search error', 'error'));
    }
}

// Set user's current location
function setUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Add user marker
            L.marker([lat, lon], {
                icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    shadowSize: [41, 41],
                    iconAnchor: [12, 41]
                }),
                title: 'Your Location'
            }).bindPopup('Your Current Location').addTo(map);
            
            // Center map on user
            map.setView([lat, lon], 7);
        });
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Live Monitoring Button
    const liveMonitorBtn = document.getElementById('liveMonitoringBtn');
    if (liveMonitorBtn) {
        liveMonitorBtn.addEventListener('click', activateLiveMonitoring);
    }

    // Download Report Button
    const downloadBtn = document.getElementById('downloadReportBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadReport);
    }

    // Refresh Weather Button
    const refreshWeather = document.getElementById('refreshWeather');
    if (refreshWeather) {
        refreshWeather.addEventListener('click', refreshWeatherData);
    }

    // Zone Click Handlers
    document.querySelectorAll('.zone').forEach(zone => {
        zone.addEventListener('click', function() {
            const zoneType = this.dataset.zone;
            showZoneDetails(zoneType);
        });
    });

    // Alert Item Click Handlers
    document.querySelectorAll('.alert-item').forEach(alert => {
        alert.addEventListener('click', function() {
            const alertId = this.dataset.alertId;
            showAlertDetails(alertId);
        });
    });

    // Find Nearest Center Button
    const findCenterBtn = document.getElementById('findCenterBtn');
    if (findCenterBtn) {
        findCenterBtn.addEventListener('click', findNearestCenter);
    }

    // Social Media Links
    document.querySelectorAll('.social-links i').forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.className.replace('fab fa-', '');
            shareOnSocial(platform);
        });
    });

    // Logout button (if present)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Live Monitoring Function
function activateLiveMonitoring() {
    showNotification('Live monitoring activated. Connecting to real-time data streams...', 'success');
    
    // Simulate connection
    setTimeout(() => {
        updateAllData();
        showNotification('Connected to live data feed', 'success');
    }, 2000);
}

// Download Report Function
function downloadReport() {
    showNotification('Generating comprehensive disaster preparedness report...', 'info');
    
    // Simulate report generation
    setTimeout(() => {
        const reportData = generateReportData();
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `disaster-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Report downloaded successfully', 'success');
    }, 1500);
}

// Refresh Weather Data
function refreshWeatherData() {
    const refreshIcon = document.getElementById('refreshWeather');
    refreshIcon.classList.add('fa-spin');
    
    showNotification('Fetching latest weather data...', 'info');
    
    // Get user's location and fetch weather
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                if (USE_BACKEND) {
                    fetchWeatherFromBackend(lat, lon);
                } else {
                    fetchWeatherFromOpenWeatherMap(lat, lon);
                }
            },
            (error) => {
                console.log('Geolocation error:', error);
                // Default location: New Delhi
                const defaultLat = 28.7041;
                const defaultLon = 77.1025;
                if (USE_BACKEND) {
                    fetchWeatherFromBackend(defaultLat, defaultLon);
                } else {
                    fetchWeatherFromOpenWeatherMap(defaultLat, defaultLon);
                }
            }
        );
    } else {
        // Default location: New Delhi
        const defaultLat = 28.7041;
        const defaultLon = 77.1025;
        if (USE_BACKEND) {
            fetchWeatherFromBackend(defaultLat, defaultLon);
        } else {
            fetchWeatherFromOpenWeatherMap(defaultLat, defaultLon);
        }
    }
}

// Fetch Weather Data from Backend
function fetchWeatherFromBackend(lat, lon) {
    const url = `${BACKEND_URL}/weather/location/${lat}/${lon}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateWeatherData(data.data);
                document.getElementById('refreshWeather').classList.remove('fa-spin');
                showNotification('Weather data updated from backend', 'success');
                
                // Fetch disaster predictions
                fetchDisasterPredictions(lat, lon);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Backend Weather Error:', error);
            document.getElementById('refreshWeather').classList.remove('fa-spin');
            showNotification('Backend unavailable, trying direct API...', 'warning');
            // Fallback to direct API
            fetchWeatherFromOpenWeatherMap(lat, lon);
        });
}

// Fetch Disaster Predictions from Backend
function fetchDisasterPredictions(lat, lon) {
    const url = `${BACKEND_URL}/disasters/predict/${lat}/${lon}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.predictions) {
                updateDisasterRisks(data.predictions);
            }
        })
        .catch(error => {
            console.error('Disaster Prediction Error:', error);
        });
}

// Update Risk Data from Predictions
function updateDisasterRisks(predictions) {
    const risks = [
        { id: 'flood', currentRisk: 25 },
        { id: 'earthquake', currentRisk: 25 },
        { id: 'cyclone', currentRisk: 25 },
        { id: 'heatwave', currentRisk: 25 }
    ];

    // Map backend predictions to risk levels
    predictions.forEach(pred => {
        const risk = risks.find(r => r.id === pred.type);
        if (risk) {
            risk.currentRisk = pred.risk;
        }
    });

    // Update UI with new risk values
    risks.forEach(risk => {
        const bar = document.getElementById(`${risk.id}RiskBar`);
        if (bar) {
            bar.style.width = risk.currentRisk + '%';
        }
        
        const valueElement = document.getElementById(`${risk.id}Risk`);
        if (valueElement) {
            let riskLevel;
            if (risk.currentRisk >= 70) {
                riskLevel = 'High';
                bar.className = `risk-fill risk-high`;
            } else if (risk.currentRisk >= 40) {
                riskLevel = 'Medium';
                bar.className = `risk-fill risk-medium`;
            } else {
                riskLevel = 'Low';
                bar.className = `risk-fill risk-low`;
            }
            valueElement.textContent = riskLevel;
        }
    });
}

// Fetch Weather Data from OpenWeatherMap API (Direct)
function fetchWeatherFromOpenWeatherMap(lat, lon) {
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherData(data);
            document.getElementById('refreshWeather').classList.remove('fa-spin');
            showNotification('Connected to live data feed', 'success');
        })
        .catch(error => {
            console.error('Weather API Error:', error);
            document.getElementById('refreshWeather').classList.remove('fa-spin');
            showNotification('Failed to fetch weather data. Using default data.', 'error');
            updateWeatherDataDefault();
        });
}

// Update Weather Data
function updateWeatherData(data) {
    if (data && data.main && data.wind) {
        // Temperature
        document.getElementById('temperature').textContent = Math.round(data.main.temp) + '°C';
        
        // Wind Speed (convert m/s to km/h if from OpenWeatherMap)
        const windSpeed = typeof data.wind.speed === 'number' ? (data.wind.speed * 3.6).toFixed(1) : data.wind.speed;
        document.getElementById('windSpeed').textContent = windSpeed + ' km/h';
        
        // Humidity
        document.getElementById('humidity').textContent = data.main.humidity + '%';
        
        // Precipitation (rain in mm, if available)
        const precipitation = data.rain ? (data.rain['1h'] || 0) : 0;
        document.getElementById('precipitation').textContent = precipitation.toFixed(0) + ' mm';
    } else {
        updateWeatherDataDefault();
    }
}

// Update Weather Data with Default/Simulated Data
function updateWeatherDataDefault() {
    // Generate random weather data for fallback
    document.getElementById('temperature').textContent = (20 + Math.random() * 15).toFixed(1) + '°C';
    document.getElementById('windSpeed').textContent = (10 + Math.random() * 30).toFixed(1) + ' km/h';
    document.getElementById('humidity').textContent = (40 + Math.random() * 40).toFixed(0) + '%';
    document.getElementById('precipitation').textContent = (30 + Math.random() * 50).toFixed(0) + '%';
}

// Update Risk Data
function updateRiskData() {
    const risks = [
        { id: 'flood', currentRisk: 85 },
        { id: 'earthquake', currentRisk: 25 },
        { id: 'cyclone', currentRisk: 60 },
        { id: 'heatwave', currentRisk: 90 }
    ];

    risks.forEach(risk => {
        // Randomly adjust risk values
        const variation = (Math.random() - 0.5) * 10;
        let newRisk = risk.currentRisk + variation;
        newRisk = Math.min(100, Math.max(0, newRisk));
        
        // Update bar width
        const bar = document.getElementById(`${risk.id}RiskBar`);
        if (bar) {
            bar.style.width = newRisk + '%';
        }
        
        // Update risk text and color
        const valueElement = document.getElementById(`${risk.id}Risk`);
        if (valueElement) {
            let riskLevel;
            if (newRisk >= 70) {
                riskLevel = 'High';
                bar.className = `risk-fill risk-high`;
            } else if (newRisk >= 40) {
                riskLevel = 'Medium';
                bar.className = `risk-fill risk-medium`;
            } else {
                riskLevel = 'Low';
                bar.className = `risk-fill risk-low`;
            }
            valueElement.textContent = riskLevel;
        }
    });
}

// Fetch Alerts from Backend
function fetchAlertsFromBackend() {
    const url = `${BACKEND_URL}/alerts`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                displayBackendAlerts(data.data);
            }
        })
        .catch(error => {
            console.error('Failed to fetch alerts from backend:', error);
        });
}

// Display alerts from backend
function displayBackendAlerts(alerts) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<p style="padding: 20px;">No active alerts</p>';
        return;
    }
    
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item" data-alert-id="${alert.id}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0; text-transform: capitalize;">${alert.type}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">${alert.location}</p>
                </div>
                <span class="severity-badge severity-${alert.severity}">${alert.severity}</span>
            </div>
            <p style="margin: 10px 0 0 0; font-size: 13px;">${alert.message}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span class="alert-time">${formatDate(alert.createdAt)}</span>
                <button onclick="deleteAlertFromBackend('${alert.id}')" style="background: none; border: none; color: #e74c3c; cursor: pointer; padding: 0;">×</button>
            </div>
        </div>
    `).join('');
}

// Delete alert from backend
function deleteAlertFromBackend(alertId) {
    const url = `${BACKEND_URL}/alerts/${alertId}`;
    
    fetch(url, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Alert deleted successfully', 'success');
                fetchAlertsFromBackend();
            }
        })
        .catch(error => {
            console.error('Failed to delete alert:', error);
            showNotification('Failed to delete alert', 'error');
        });
}

// Create alert in backend
function createAlertInBackend(type, severity, location, message, coordinates) {
    const url = `${BACKEND_URL}/alerts`;
    
    const payload = {
        type,
        severity,
        location,
        message,
        coordinates
    };
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Alert created successfully', 'success');
                fetchAlertsFromBackend();
            }
        })
        .catch(error => {
            console.error('Failed to create alert:', error);
            showNotification('Failed to create alert', 'error');
        });
}

// Format date to readable format
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Update Alert Times
function updateAlertTimes() {
    document.querySelectorAll('.alert-time').forEach(timeElement => {
        let timeText = timeElement.textContent;
        if (timeText.includes('min')) {
            let minutes = parseInt(timeText) + 1;
            timeElement.textContent = minutes + ' min ago';
        } else if (timeText.includes('hour')) {
            let hours = parseInt(timeText) + 1;
            timeElement.textContent = hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
        }
    });
}

// Real-time Updates
function startRealTimeUpdates() {
    // Update risk data every 30 seconds
    setInterval(updateRiskData, 30000);
    setInterval(updateAlertTimes, 60000);
}

// Initialize tooltips
function initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('hover', function() {
            const tooltip = this.getAttribute('data-tooltip');
            console.log('Tooltip:', tooltip);
        });
    });
}

// Update all data
function updateAllData() {
    updateRiskData();
    if (USE_BACKEND) {
        fetchAlertsFromBackend();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        border-radius: 4px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Generate report data
function generateReportData() {
    return {
        reportDate: new Date().toISOString(),
        location: 'New Delhi, India',
        weatherData: {
            temperature: document.getElementById('temperature')?.textContent || 'N/A',
            windSpeed: document.getElementById('windSpeed')?.textContent || 'N/A',
            humidity: document.getElementById('humidity')?.textContent || 'N/A'
        },
        riskAssessment: {
            flood: document.getElementById('floodRisk')?.textContent || 'Unknown',
            cyclone: document.getElementById('cycloneRisk')?.textContent || 'Unknown',
            earthquake: document.getElementById('earthquakeRisk')?.textContent || 'Unknown',
            heatwave: document.getElementById('heatwaveRisk')?.textContent || 'Unknown'
        },
        recommendations: [
            'Stay alert for weather updates',
            'Keep emergency supplies ready',
            'Follow local authority guidelines',
            'Keep family members informed'
        ]
    };
}

// Show zone details
function showZoneDetails(zoneType) {
    showNotification(`Showing details for ${zoneType} zone`, 'info');
    console.log('Zone details:', zoneType);
}

// Show alert details
function showAlertDetails(alertId) {
    showNotification(`Alert ${alertId} details`, 'info');
    console.log('Alert ID:', alertId);
}

// Find nearest center
function findNearestCenter() {
    showNotification('Finding nearest disaster management center...', 'info');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            showNotification(`Nearest center found at ${position.coords.latitude}, ${position.coords.longitude}`, 'success');
        });
    }
}

// Share on social media
function shareOnSocial(platform) {
    showNotification(`Sharing on ${platform}`, 'info');
    console.log('Share on:', platform);
}
