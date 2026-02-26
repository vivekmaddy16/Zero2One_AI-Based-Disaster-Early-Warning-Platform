const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get weather data by coordinates
router.get('/location/:lat/:lon', weatherController.getWeatherByCoordinates);

// Get weather data by city name
router.get('/city/:cityName', weatherController.getWeatherByCity);

// Get weather forecast
router.get('/forecast/:lat/:lon', weatherController.getWeatherForecast);

// Get all cached weather data
router.get('/all', weatherController.getAllWeatherData);

module.exports = router;
