const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Disaster Early Warning System - Backend Running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

module.exports = router;
