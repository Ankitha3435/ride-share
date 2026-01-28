const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const rideRoutes = require("./routes/ride");
const adminRoutes = require("./routes/admin");
const issuesRoutes = require("./routes/issues");
const bugReportRoutes = require("./routes/bugReports");
const logger = require("./config/logger");
const checkMaintenanceMode = require("./middleware/maintenance");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'null' // For local file testing
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Public maintenance mode check (no auth required)
app.get('/api/maintenance-status', async (req, res) => {
  try {
    const MaintenanceMode = require('./models/MaintenanceMode');
    const maintenanceMode = await MaintenanceMode.getInstance();
    res.json({
      success: true,
      isActive: maintenanceMode.isActive,
      message: maintenanceMode.message,
    });
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    res.json({
      success: true,
      isActive: false,
      message: '',
    });
  }
});

// Apply maintenance mode middleware to all routes
app.use(checkMaintenanceMode);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/bug-reports", bugReportRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || req.user?._id
  });
  
  res.status(err.status || 500).json({
    message: err.message || 'An error occurred'
  });
});

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

startServer();

