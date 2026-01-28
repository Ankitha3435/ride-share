const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// JWT Authentication Middleware (replaces Passport)
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token
    if (decoded.isAdmin === true) {
      const admin = await Admin.findById(decoded.id);
      
      if (!admin) {
        return res.status(401).json({ 
          message: 'Admin not found. Please login again.' 
        });
      }

      // Attach admin as user to request with isAdmin flag
      req.user = {
        _id: admin._id,
        id: admin._id,
        email: admin.email,
        name: admin.name,
        username: admin.username,
        isAdmin: true
      };
      return next();
    }

    // Get regular user from database (including test users)
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found. Please login again.' 
      });
    }

    // Attach user to request (with test user flag if applicable)
    req.user = user;
    if (decoded.isTestUser === true) {
      req.user.isTestUser = true;
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(500).json({ 
      message: 'Authentication failed.' 
    });
  }
};

// Admin authentication middleware
exports.isAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'Admin access required.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(500).json({ 
      message: 'Authorization failed.' 
    });
  }
};
