const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const adminController = require('../controller/admin');
const { getRideDetails } = require('../controller/admin');

// Apply auth middleware to all routes - isAuthenticated handles admin tokens
// isAdmin checks if the authenticated user has admin privileges
router.use(isAuthenticated);
router.use(isAdmin);

// Get all users (admin only)
router.get('/users', adminController.getUsers);

// Get user by ID (admin only)
router.get('/users/:id', adminController.getUserById);

// Update user (admin only)
router.put('/users/:id', adminController.updateUser);

// Delete user (admin only)
router.delete('/users/:id', adminController.deleteUser);
  
// Get all rides (admin only)
router.get('/rides', adminController.getAllRides);

router.get('/rides/:id', adminController.getRideDetails);

// Delete ride (admin only)
router.delete('/rides/:id', adminController.deleteRide);

// Reset database (admin only)
router.post('/reset-database', adminController.resetDatabase);

// Maintenance mode routes (admin only)
router.get('/maintenance-mode', adminController.getMaintenanceMode);
router.post('/maintenance-mode', adminController.toggleMaintenanceMode);

module.exports = router;