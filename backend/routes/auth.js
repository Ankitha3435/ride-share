const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const authMiddleware = require("../middleware/auth");
const { checkUserLimit } = require("../middleware/userLimit");
require("dotenv").config();

// PESU Login route (with user limit check)
router.post("/login", checkUserLimit, authController.pesuLogin);

// Admin Login route
router.post("/admin/login", authController.adminLogin);

// Test Login route (for authorized test users only)
router.post("/test/login", authController.testLogin);

// Logout route
router.post("/logout", authController.logout);

// Update active roles
router.put(
  "/active-roles",
  authMiddleware.isAuthenticated,
  authController.updateActiveRoles
);

// Update driver profile completion status
router.put(
  "/driver-profile-complete",
  authMiddleware.isAuthenticated,
  authController.updateDriverProfileComplete
);

// Update hitcher profile completion status
router.put(
  "/hitcher-profile-complete",
  authMiddleware.isAuthenticated,
  authController.updateHitcherProfileComplete
);

module.exports = router;
