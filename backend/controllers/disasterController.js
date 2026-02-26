const axios = require('axios');
require('dotenv').config();

const WEATHER_API_URL = process.env.WEATHER_API_URL;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Disaster prediction based on weather data
exports.predictDisasters = async (req, res) => {
    try {
        const { lat, lon } = req.params;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Fetch weather data
        const weatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        // Analyze weather data for disaster patterns
        const predictions = analyzeDisasterRisk(weatherData);

        res.json({
            success: true,
            location: {
                name: weatherData.name || 'Unknown',
                coordinates: { lat, lon }
            },
            predictions: predictions,
            weather: {
                temp: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                pressure: weatherData.main.pressure,
                description: weatherData.weather[0].description
            }
        });
    } catch (error) {
        console.error('Prediction Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to predict disasters',
            error: error.message
        });
    }
};

// Get risk assessment
exports.getRiskAssessment = async (req, res) => {
    try {
        const { lat, lon } = req.params;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Fetch weather data
        const weatherUrl = `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        const riskAssessment = calculateRiskAssessment(weatherData);

        res.json({
            success: true,
            location: weatherData.name || 'Unknown',
            riskAssessment: riskAssessment,
            overallRisk: calculateOverallRisk(riskAssessment)
        });
    } catch (error) {
        console.error('Risk Assessment Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate risk assessment',
            error: error.message
        });
    }
};

// Get all disaster types
exports.getAllDisasters = (req, res) => {
    const disasters = [
        { type: 'flood', description: 'Flooding risk' },
        { type: 'cyclone', description: 'Cyclone/Hurricane risk' },
        { type: 'earthquake', description: 'Earthquake risk' },
        { type: 'heatwave', description: 'Extreme heat risk' },
        { type: 'drought', description: 'Drought risk' },
        { type: 'landslide', description: 'Landslide risk' }
    ];

    res.json({
        success: true,
        data: disasters
    });
};

// Get disaster by type
exports.getDisasterByType = (req, res) => {
    try {
        const { type } = req.params;
        const disasters = [
            { type: 'flood', description: 'Flooding risk', indicators: ['Heavy rainfall', 'High humidity'] },
            { type: 'cyclone', description: 'Cyclone/Hurricane risk', indicators: ['High wind speed', 'Low pressure'] },
            { type: 'earthquake', description: 'Earthquake risk', indicators: ['Tectonic activity'] },
            { type: 'heatwave', description: 'Extreme heat risk', indicators: ['High temperature'] },
            { type: 'drought', description: 'Drought risk', indicators: ['Low humidity', 'High temperature'] },
            { type: 'landslide', description: 'Landslide risk', indicators: ['Heavy rainfall', 'Mountainous terrain'] }
        ];

        const disaster = disasters.find(d => d.type.toLowerCase() === type.toLowerCase());

        if (!disaster) {
            return res.status(404).json({
                success: false,
                message: 'Disaster type not found'
            });
        }

        res.json({
            success: true,
            data: disaster
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch disaster info',
            error: error.message
        });
    }
};

// Helper function: Analyze disaster risk based on weather
function analyzeDisasterRisk(weatherData) {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;
    const rain = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;

    const predictions = [];

    // Flood risk
    if (humidity > 80 || rain > 10) {
        predictions.push({
            type: 'flood',
            risk: calculateRiskScore(humidity, 80, rain, 10),
            indicators: ['High humidity', 'Heavy rainfall'],
            recommendation: 'Stay alert for flooding in low-lying areas'
        });
    }

    // Cyclone risk
    if (windSpeed > 15 || pressure < 1000) {
        predictions.push({
            type: 'cyclone',
            risk: calculateRiskScore(windSpeed, 15, pressure, 1000, true),
            indicators: ['High wind speed', 'Low atmospheric pressure'],
            recommendation: 'Prepare for severe weather conditions'
        });
    }

    // Heatwave risk
    if (temp > 35) {
        predictions.push({
            type: 'heatwave',
            risk: calculateRiskScore(temp, 35),
            indicators: ['Extreme heat'],
            recommendation: 'Stay hydrated and avoid prolonged sun exposure'
        });
    }

    // Drought risk
    if (humidity < 30 && temp > 25) {
        predictions.push({
            type: 'drought',
            risk: calculateRiskScore(humidity, 30, temp, 25, true),
            indicators: ['Low humidity', 'High temperature'],
            recommendation: 'Conserve water and monitor agricultural conditions'
        });
    }

    return predictions;
}

// Helper function: Calculate risk assessment
function calculateRiskAssessment(weatherData) {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;

    return {
        flood: humidity > 80 ? Math.min(100, humidity) : 0,
        cyclone: windSpeed > 10 ? Math.min(100, windSpeed * 5) : 0,
        earthquake: 25,
        heatwave: temp > 25 ? Math.min(100, (temp - 25) * 4) : 0,
        drought: humidity < 40 && temp > 25 ? Math.min(100, (40 - humidity) * 2.5) : 0
    };
}

// Helper function: Calculate overall risk
function calculateOverallRisk(riskAssessment) {
    const risks = Object.values(riskAssessment);
    const average = risks.reduce((a, b) => a + b, 0) / risks.length;
    return Math.round(average);
}

// Helper function: Calculate risk score
function calculateRiskScore(...values) {
    let score = 0;
    for (let i = 0; i < values.length - 1; i += 2) {
        const current = values[i];
        const threshold = values[i + 1];
        const isInverse = values[values.length - 1] === true;
        
        if (isInverse) {
            score += Math.max(0, (threshold - current) / threshold) * 100;
        } else {
            score += Math.max(0, (current - threshold) / threshold) * 100;
        }
    }
    return Math.min(100, Math.round(score / 2));
}
