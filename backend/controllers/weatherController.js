const axios = require('axios');
require('dotenv').config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL;

// Cache for weather data
let weatherCache = {};

// Get weather by coordinates
exports.getWeatherByCoordinates = async (req, res) => {
    try {
        const { lat, lon } = req.params;
        
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const cacheKey = `${lat}-${lon}`;
        
        // Check cache (valid for 10 minutes)
        if (weatherCache[cacheKey] && (Date.now() - weatherCache[cacheKey].timestamp < 600000)) {
            return res.json({
                success: true,
                data: weatherCache[cacheKey].data,
                cached: true
            });
        }

        // Fetch from OpenWeatherMap
        const url = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);

        weatherCache[cacheKey] = {
            data: response.data,
            timestamp: Date.now()
        };

        res.json({
            success: true,
            data: response.data,
            cached: false
        });
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error.message
        });
    }
};

// Get weather by city name
exports.getWeatherByCity = async (req, res) => {
    try {
        const { cityName } = req.params;
        
        if (!cityName) {
            return res.status(400).json({
                success: false,
                message: 'City name is required'
            });
        }

        const url = `${WEATHER_API_URL}/weather?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error.message
        });
    }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res) => {
    try {
        const { lat, lon } = req.params;
        
        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const url = `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error('Forecast API Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch forecast data',
            error: error.message
        });
    }
};

// Get all cached weather data
exports.getAllWeatherData = (req, res) => {
    res.json({
        success: true,
        data: weatherCache,
        cacheSize: Object.keys(weatherCache).length
    });
};
