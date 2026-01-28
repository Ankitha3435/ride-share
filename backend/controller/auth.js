require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authenticateWithPESU, mapCampusToCollege } = require('../config/pesu-auth');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// PESU Login
exports.pesuLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Authenticate with PESU server
    const authResult = await authenticateWithPESU(username, password);

    if (!authResult.success) {
      return res.status(authResult.statusCode || 401).json({
        success: false,
        message: authResult.error || "Authentication failed"
      });
    }

    const profile = authResult.profile;

    // Validate that we received profile data
    if (!profile || !profile.name || !profile.email) {
      console.error('Invalid profile data from PESU Auth:', profile);
      return res.status(500).json({
        success: false,
        message: "Failed to get profile data from PESU Auth server. Please try again."
      });
    }

    // Check if user is an admin (if email is provided)
    let isAdmin = false;
    if (profile.email) {
      const admin = await Admin.findOne({ email: profile.email });
      isAdmin = !!admin;
    }

    // Map campus to college name
    const college = mapCampusToCollege(profile.campus_code, profile.campus);

    // Check if user already exists
    let user = await User.findOne({ username: username.toUpperCase() });

    if (user) {
      // Update user with latest PESU profile data
      user.name = profile.name || user.name;
      user.email = profile.email || user.email;
      user.prn = profile.prn || user.prn;
      user.srn = profile.srn || user.srn;
      user.program = profile.program || user.program;
      user.branch = profile.branch || user.branch;
      user.semester = profile.semester || user.semester;
      user.section = profile.section || user.section;
      user.phone = profile.phone || user.phone;
      user.campus_code = profile.campus_code;
      user.campus = profile.campus;
      user.college = college;
      user.isAdmin = isAdmin;

      await user.save();
    } else {
      // Create new user
      user = new User({
        username: username.toUpperCase(),
        name: profile.name,
        email: profile.email,
        prn: profile.prn,
        srn: profile.srn || username.toUpperCase(),
        program: profile.program,
        branch: profile.branch,
        semester: profile.semester,
        section: profile.section,
        phone: profile.phone,
        campus_code: profile.campus_code,
        campus: profile.campus,
        college: college,
        activeRoles: {
          driver: false,
          hitcher: false,
        },
        driverProfileComplete: false,
        hitcherProfileComplete: false,
        isAdmin: isAdmin
      });

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        srn: user.srn,
        college: user.college,
        isAdmin: user.isAdmin,
        activeRoles: user.activeRoles,
        driverProfileComplete: user.driverProfileComplete,
        hitcherProfileComplete: user.hitcherProfileComplete
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again."
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Find admin by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token with admin flag
    const token = jwt.sign(
      { 
        id: admin._id,
        isAdmin: true,
        email: admin.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        isAdmin: true
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred during login. Please try again." 
    });
  }
};

exports.testLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Define allowed test users
    const ALLOWED_TEST_USERS = ['PES2UG22CS099', 'PES2UG22CS079', 'PES2UG22CS129', 'PES1UG22EC104', 'PES1UG21BB139'];

    // Check if the username is in the allowed test users list
    if (!ALLOWED_TEST_USERS.includes(username.toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: "Access denied. This endpoint is restricted to authorized test users only."
      });
    }

    // Authenticate with PESU server
    const authResult = await authenticateWithPESU(username, password);

    if (!authResult.success) {
      return res.status(authResult.statusCode || 401).json({
        success: false,
        message: authResult.error || "Authentication failed"
      });
    }

    const profile = authResult.profile;

    // Validate that we received profile data
    if (!profile || !profile.name || !profile.email) {
      console.error('Invalid profile data from PESU Auth:', profile);
      return res.status(500).json({
        success: false,
        message: "Failed to get profile data from PESU Auth server. Please try again."
      });
    }

    // Map campus to college name
    const college = mapCampusToCollege(profile.campus_code, profile.campus);

    // Check if user already exists
    let user = await User.findOne({ username: username.toUpperCase() });

    if (user) {
      // Update user with latest PESU profile data
      user.name = profile.name || user.name;
      user.email = profile.email || user.email;
      user.prn = profile.prn || user.prn;
      user.srn = profile.srn || user.srn;
      user.program = profile.program || user.program;
      user.branch = profile.branch || user.branch;
      user.semester = profile.semester || user.semester;
      user.section = profile.section || user.section;
      user.phone = profile.phone || user.phone;
      user.campus_code = profile.campus_code;
      user.campus = profile.campus;
      user.college = college;
      user.isTestUser = true; // Mark as test user

      await user.save();
    } else {
      // Create new user
      user = new User({
        username: username.toUpperCase(),
        name: profile.name,
        email: profile.email,
        prn: profile.prn,
        srn: profile.srn || username.toUpperCase(),
        program: profile.program,
        branch: profile.branch,
        semester: profile.semester,
        section: profile.section,
        phone: profile.phone,
        campus_code: profile.campus_code,
        campus: profile.campus,
        college: college,
        activeRoles: {
          driver: false,
          hitcher: false,
        },
        driverProfileComplete: false,
        hitcherProfileComplete: false,
        isAdmin: false,
        isTestUser: true // Mark as test user
      });

      await user.save();
    }

    // Generate JWT token with testUser flag
    const token = jwt.sign(
      { 
        id: user._id,
        isTestUser: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Test user login successful:', {
      username: user.username,
      name: user.name,
      timestamp: new Date().toISOString()
    });

    // Return token and user data
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        srn: user.srn,
        college: user.college,
        isAdmin: user.isAdmin,
        isTestUser: true,
        activeRoles: user.activeRoles,
        driverProfileComplete: user.driverProfileComplete,
        hitcherProfileComplete: user.hitcherProfileComplete
      }
    });

  } catch (error) {
    console.error("Test login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again."
    });
  }
};

exports.logout = (req, res) => {
  // For JWT-based auth, logout is handled client-side by removing the token
  // But we keep this endpoint for consistency
  res.json({ message: "Logged out successfully" });
};

// understand from here
exports.updateActiveRoles = (req, res) => {
  // User is already authenticated by the middleware
  const { driver, hitcher } = req.body;

  // Validate input
  if (typeof driver !== "boolean" && typeof hitcher !== "boolean") {
    return res.status(400).json({ message: "Invalid role settings" });
  }

  // Update active roles
  if (typeof driver === "boolean") {
    req.user.activeRoles.driver = driver;
  }

  if (typeof hitcher === "boolean") {
    req.user.activeRoles.hitcher = hitcher;
  }

  req.user
    .save()
    .then(() => {
      res.json({
        message: "Active roles updated successfully",
        activeRoles: req.user.activeRoles,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error updating active roles", error: err.message });
    });
};

exports.updateDriverProfileComplete = (req, res) => {
  // User is already authenticated by the middleware
  const { complete } = req.body;

  if (typeof complete !== "boolean") {
    return res.status(400).json({ message: "Invalid profile complete status" });
  }

  req.user.driverProfileComplete = complete;
  req.user
    .save()
    .then(() => {
      res.json({
        message: "Driver profile status updated successfully",
        driverProfileComplete: complete,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error updating profile status", error: err.message });
    });
};

exports.updateHitcherProfileComplete = (req, res) => {
  // User is already authenticated by the middleware
  const { complete } = req.body;

  if (typeof complete !== "boolean") {
    return res.status(400).json({ message: "Invalid profile complete status" });
  }

  req.user.hitcherProfileComplete = complete;
  req.user
    .save()
    .then(() => {
      res.json({
        message: "Hitcher profile status updated successfully",
        hitcherProfileComplete: complete,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error updating profile status", error: err.message });
    });
};
