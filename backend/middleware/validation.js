const { body, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Driver profile validation rules (user profile data comes from PESU auth API)
const driverProfileRules = [
    body('vehicle.model').trim().notEmpty().withMessage('Vehicle model is required'),
    body('vehicle.type').isIn(['scooter/bike', 'car']).withMessage('Vehicle type must be either scooter/bike or car'),
    body('vehicle.seats').isInt({ min: 1, max: 6 }).withMessage('Invalid number of seats'),
    body('pricePerKm').isFloat({ min: 1, max: 10 }).withMessage('Price must be between 1 and 10'),
];

// Ride validation rules
const rideRules = [
    body('startLocation').notEmpty().withMessage('Start location is required'),
    body('endLocation').notEmpty().withMessage('End location is required'),
    body('date').isISO8601().toDate().withMessage('Invalid date format'),
    body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('seats').isInt({ min: 1, max: 6 }).withMessage('Invalid number of seats'),
];

// Issue report validation rules
const issueReportRules = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('type').isIn(['bug', 'feature']).withMessage('Invalid report type'),
];

module.exports = {
    handleValidationErrors,
    driverProfileRules,
    rideRules,
    issueReportRules,
}; 