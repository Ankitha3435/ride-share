const User = require('../models/User');
const Ride = require('../models/Ride');
const Issue = require('../models/Issue');
const BugReport = require('../models/BugReport');
const MaintenanceMode = require('../models/MaintenanceMode');
const { initReliability } = require('../utils/reliabilityHelper');

exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        // Build query filters
        const query = {};
        
        // Filter by campus
        if (req.query.campus && req.query.campus !== 'all') {
            query.college = req.query.campus;
        }
        
        // Filter by role (based on current active role, not completed profiles)
        if (req.query.role && req.query.role !== 'all') {
            if (req.query.role === 'driver') {
                // Show users whose current active role is driver (even if they have both profiles)
                query['activeRoles.driver'] = true;
            } else if (req.query.role === 'hitcher') {
                // Show users whose current active role is hitcher (even if they have both profiles)
                query['activeRoles.hitcher'] = true;
            } else if (req.query.role === 'both') {
                // Show users who have both roles currently active
                query['activeRoles.driver'] = true;
                query['activeRoles.hitcher'] = true;
            }
        }
        
        // Build sort options
        let sortOptions = { createdAt: -1 }; // Default sort by newest
        if (req.query.sortBy) {
            switch (req.query.sortBy) {
                case 'name':
                    sortOptions = { name: 1 };
                    break;
                case 'nameDesc':
                    sortOptions = { name: -1 };
                    break;
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
            }
        }
        
        const users = await User.find(query)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort(sortOptions);
        
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasMore: skip + users.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { phone, gender, homeAddress, homeCoordinates, vehicleType, driverReliabilityRate, hitcherReliabilityRate } = req.body;
        
        // Validate gender
        if (gender !== 'male' && gender !== 'female') {
            return res.status(400).json({ error: 'Gender must be either male or female' });
        }
        
        // Find the user first
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update basic fields
        user.phone = phone;
        user.gender = gender;
        user.homeAddress = homeAddress;
        
        // Update coordinates if provided (admin only feature)
        if (homeCoordinates && homeCoordinates.lat && homeCoordinates.lng) {
            user.homeCoordinates = {
                lat: homeCoordinates.lat,
                lng: homeCoordinates.lng
            };
        }
        
        // Update vehicle type if provided and user has driver profile
        if (vehicleType !== undefined && user.driverProfile && user.driverProfile.vehicle) {
            if (vehicleType !== 'scooter/bike' && vehicleType !== 'car') {
                return res.status(400).json({ error: 'Vehicle type must be either scooter/bike or car' });
            }
            user.driverProfile.vehicle.type = vehicleType;
            
            // If vehicle type is scooter/bike, enforce 1 seat only (no price enforcement)
            if (vehicleType === 'scooter/bike') {
                user.driverProfile.vehicle.seats = 1;
            }
        }
        
        // Update driver reliability rate if provided and user has driver profile
        if (driverReliabilityRate !== undefined && user.driverProfile) {
            if (driverReliabilityRate < 0 || driverReliabilityRate > 100) {
                return res.status(400).json({ error: 'Driver reliability rate must be between 0 and 100' });
            }
            user.driverProfile.reliabilityRate = driverReliabilityRate;
        }
        
        // Update hitcher reliability rate if provided and user has hitcher profile
        if (hitcherReliabilityRate !== undefined && user.hitcherProfile) {
            if (hitcherReliabilityRate < 0 || hitcherReliabilityRate > 100) {
                return res.status(400).json({ error: 'Hitcher reliability rate must be between 0 and 100' });
            }
            user.hitcherProfile.reliabilityRate = hitcherReliabilityRate;
        }
        
        // Save the updated user
        await user.save();
        
        console.log('User updated successfully by admin:', {
            userId: user._id,
            name: user.name,
            phone,
            gender,
            homeAddress,
            homeCoordinates,
            vehicleType,
            driverReliabilityRate,
            hitcherReliabilityRate
        });
        
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        // Check if user exists and is not an admin
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.isAdmin) {
            return res.status(403).json({ error: 'Admin users cannot be deleted' });
        }
        
        // Delete the user
        await User.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.getAllRides = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build query filters
    const query = {};
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Filter by direction
    if (req.query.direction && req.query.direction !== 'all') {
      query.direction = req.query.direction;
    }
    
    // Filter by vehicle type
    if (req.query.vehicleType && req.query.vehicleType !== 'all') {
      query.vehicleType = req.query.vehicleType;
    }
    
    // Filter by date range
    if (req.query.dateFrom || req.query.dateTo) {
      query.date = {};
      if (req.query.dateFrom) {
        query.date.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        query.date.$lte = dateTo;
      }
    }
    
    // Build sort options
    let sortOptions = { date: -1 }; // Default sort by newest date
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'dateAsc':
          sortOptions = { date: 1 };
          break;
        case 'dateDesc':
          sortOptions = { date: -1 };
          break;
        case 'priceAsc':
          sortOptions = { pricePerKm: 1 };
          break;
        case 'priceDesc':
          sortOptions = { pricePerKm: -1 };
          break;
        case 'seatsAsc':
          sortOptions = { availableSeats: 1 };
          break;
        case 'seatsDesc':
          sortOptions = { availableSeats: -1 };
          break;
      }
    }
    
    const rides = await Ride.find(query)
      .populate('driver', 'name email phone srn college')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);
    
    const total = await Ride.countDocuments(query);
    
    res.json({
      rides,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRides: total,
        hasMore: skip + rides.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name email phone srn gender')
      .populate({
        path: 'hitchers.user',
        select: 'name email phone srn gender'
      });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride has accepted hitchers
    const acceptedHitchers = ride.hitchers.filter(hitcher => hitcher.status === 'accepted');
    if (acceptedHitchers.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete ride with accepted hitchers. Please cancel the ride first.',
        hasAcceptedHitchers: true,
        acceptedCount: acceptedHitchers.length
      });
    }

    // Delete the ride
    await Ride.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetDatabase = async (req, res) => {
  try {
    // Make sure the user making the request is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can reset the database'
      });
    }

    // Delete all rides
    await Ride.deleteMany({});

    // Delete all issues
    await Issue.deleteMany({});

    // Delete all bug reports
    await BugReport.deleteMany({});

    await initReliability();

    return res.status(200).json({
      success: true,
      message: 'Database has been reset successfully',
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting the database',
      error: error.message
    });
  }
};

exports.getMaintenanceMode = async (req, res) => {
  try {
    const maintenanceMode = await MaintenanceMode.getInstance();
    res.json({
      success: true,
      isActive: maintenanceMode.isActive,
      message: maintenanceMode.message,
      enabledAt: maintenanceMode.enabledAt,
    });
  } catch (error) {
    console.error('Error fetching maintenance mode:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

exports.toggleMaintenanceMode = async (req, res) => {
  try {
    // Make sure the user making the request is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can toggle maintenance mode'
      });
    }

    const { isActive, message } = req.body;
    const maintenanceMode = await MaintenanceMode.getInstance();
    
    maintenanceMode.isActive = isActive;
    
    if (message) {
      maintenanceMode.message = message;
    }
    
    if (isActive) {
      maintenanceMode.enabledBy = req.user.id;
      maintenanceMode.enabledAt = new Date();
      console.log('Maintenance mode ENABLED by admin:', {
        adminId: req.user.id,
        timestamp: new Date().toISOString()
      });
    } else {
      maintenanceMode.disabledAt = new Date();
      console.log('Maintenance mode DISABLED by admin:', {
        adminId: req.user.id,
        timestamp: new Date().toISOString()
      });
    }
    
    await maintenanceMode.save();
    
    res.json({
      success: true,
      message: `Maintenance mode ${isActive ? 'enabled' : 'disabled'} successfully`,
      maintenanceMode: {
        isActive: maintenanceMode.isActive,
        message: maintenanceMode.message,
        enabledAt: maintenanceMode.enabledAt,
        disabledAt: maintenanceMode.disabledAt,
      }
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};