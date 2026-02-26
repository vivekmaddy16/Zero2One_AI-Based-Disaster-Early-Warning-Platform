const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// Get all alerts
router.get('/', alertController.getAllAlerts);

// Get alert by ID
router.get('/:id', alertController.getAlertById);

// Create new alert
router.post('/', alertController.createAlert);

// Update alert
router.put('/:id', alertController.updateAlert);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

// Get alerts by type
router.get('/type/:type', alertController.getAlertsByType);

// Get active alerts
router.get('/status/active', alertController.getActiveAlerts);

module.exports = router;
