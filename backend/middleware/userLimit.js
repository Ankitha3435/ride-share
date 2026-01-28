const User = require('../models/User');

/**
 * Middleware to enforce user registration limit
 * Set MAX_USERS in .env to control limit
 * This only blocks NEW user registrations, not existing user logins
 */
exports.checkUserLimit = async (req, res, next) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            // If no username provided, let the auth controller handle the validation
            return next();
        }
        
        // Check if this is an existing user trying to login
        const existingUser = await User.findOne({ username: username.toUpperCase() });
        
        // If user already exists, allow them to login regardless of user limit
        if (existingUser) {
            return next();
        }
        
        // This is a new user registration attempt
        // Get the maximum allowed users from environment variable
        const MAX_USERS = parseInt(process.env.MAX_USERS) || 300; // Default to 50
        
        // Count total users (excluding admins)
        const userCount = await User.countDocuments({ isAdmin: { $ne: true } });
        
        if (userCount >= MAX_USERS) {
            return res.status(503).json({
                success: false,
                message: 'Registration is currently closed. We have reached maximum capacity. Please try again later.',
                error: 'MAX_USERS_REACHED'
            });
        }
        
        next();
    } catch (error) {
        console.error('Error checking user limit:', error);
        // Don't block registration if check fails
        next();
    }
};

