const MaintenanceMode = require('../models/MaintenanceMode');
const jwt = require('jsonwebtoken');

/**
 * Middleware to check if maintenance mode is active
 * Blocks all requests except for admin routes, test user routes, and maintenance status checks
 */
const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for these paths
    const allowedPaths = [
      '/api/maintenance-status',
      '/health',
      '/api/auth/admin/login',  // Allow admin login
      '/api/auth/admin/check',  // Allow admin auth check
      '/api/auth/test/login',   // Allow test login
    ];
    
    // Allow admin routes to bypass maintenance mode
    const isAdminRoute = req.path.startsWith('/api/admin');
    
    if (allowedPaths.includes(req.path) || isAdminRoute) {
      return next();
    }
    
    // Check if user is a test user (from JWT token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If user is a test user or admin, bypass maintenance mode
        if (decoded.isTestUser === true || decoded.isAdmin === true) {
          return next();
        }
      } catch (error) {
        // Token verification failed, continue with maintenance check
        // Don't return here, let the normal maintenance check proceed
      }
    }
    
    const maintenanceMode = await MaintenanceMode.getInstance();
    
    if (maintenanceMode.isActive) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: maintenanceMode.message || "We're currently performing scheduled maintenance. We'll be back shortly!",
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // If there's an error checking maintenance mode, allow the request to proceed
    next();
  }
};

module.exports = checkMaintenanceMode;

