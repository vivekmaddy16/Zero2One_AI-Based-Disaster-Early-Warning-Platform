const fs = require('fs');
const path = require('path');

const alertsFile = path.join(__dirname, '../data/alerts.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize alerts file
if (!fs.existsSync(alertsFile)) {
    fs.writeFileSync(alertsFile, JSON.stringify([], null, 2));
}

// Helper function to read alerts
const readAlerts = () => {
    try {
        const data = fs.readFileSync(alertsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Helper function to write alerts
const writeAlerts = (alerts) => {
    fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
};

// Get all alerts
exports.getAllAlerts = (req, res) => {
    try {
        const alerts = readAlerts();
        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alerts',
            error: error.message
        });
    }
};

// Get alert by ID
exports.getAlertById = (req, res) => {
    try {
        const { id } = req.params;
        const alerts = readAlerts();
        const alert = alerts.find(a => a.id === id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alert',
            error: error.message
        });
    }
};

// Create new alert
exports.createAlert = (req, res) => {
    try {
        const { type, severity, location, message, coordinates } = req.body;

        if (!type || !severity || !location) {
            return res.status(400).json({
                success: false,
                message: 'Type, severity, and location are required'
            });
        }

        const alerts = readAlerts();
        const newAlert = {
            id: Date.now().toString(),
            type,
            severity,
            location,
            message: message || '',
            coordinates: coordinates || {},
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        alerts.push(newAlert);
        writeAlerts(alerts);

        res.status(201).json({
            success: true,
            message: 'Alert created successfully',
            data: newAlert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create alert',
            error: error.message
        });
    }
};

// Update alert
exports.updateAlert = (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const alerts = readAlerts();
        const index = alerts.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        alerts[index] = { ...alerts[index], ...updates, id };
        writeAlerts(alerts);

        res.json({
            success: true,
            message: 'Alert updated successfully',
            data: alerts[index]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update alert',
            error: error.message
        });
    }
};

// Delete alert
exports.deleteAlert = (req, res) => {
    try {
        const { id } = req.params;
        const alerts = readAlerts();
        const filteredAlerts = alerts.filter(a => a.id !== id);

        if (filteredAlerts.length === alerts.length) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        writeAlerts(filteredAlerts);

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete alert',
            error: error.message
        });
    }
};

// Get alerts by type
exports.getAlertsByType = (req, res) => {
    try {
        const { type } = req.params;
        const alerts = readAlerts();
        const filtered = alerts.filter(a => a.type.toLowerCase() === type.toLowerCase());

        res.json({
            success: true,
            data: filtered,
            count: filtered.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alerts',
            error: error.message
        });
    }
};

// Get active alerts
exports.getActiveAlerts = (req, res) => {
    try {
        const alerts = readAlerts();
        const active = alerts.filter(a => a.status === 'active');

        res.json({
            success: true,
            data: active,
            count: active.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active alerts',
            error: error.message
        });
    }
};
