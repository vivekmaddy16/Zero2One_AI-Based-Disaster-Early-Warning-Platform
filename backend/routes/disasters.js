const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');

// Get disaster predictions
router.get('/predict/:lat/:lon', disasterController.predictDisasters);

// Get risk assessment
router.get('/risk/:lat/:lon', disasterController.getRiskAssessment);

// Get all disasters
router.get('/', disasterController.getAllDisasters);

// Get disaster by type
router.get('/type/:type', disasterController.getDisasterByType);

module.exports = router;
