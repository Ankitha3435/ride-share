const User = require('../models/User');

/**
 * Resets all user reliability metrics to default values
 * This version doesn't manage the database connection - it assumes one already exists
 */
const initReliability = async () => {
    try {
        // First, delete all users without usernames (old Google Auth data)
        const deleteResult = await User.deleteMany({ 
            $or: [
                { username: { $exists: false } },
                { username: null }
            ]
        });
        console.log(`Deleted ${deleteResult.deletedCount} old users without usernames`);

        // Now find all valid users with usernames (PESU auth users)
        const users = await User.find({ username: { $exists: true, $ne: null } });
        console.log(`Found ${users.length} valid PESU users`);

        for (const user of users) {
            if (user.driverProfile) {
                user.driverProfile.totalRidesCreated = 0;
                user.driverProfile.completedRides = 0;
                user.driverProfile.cancelledAcceptedRides = 0;
                user.driverProfile.cancelledNonAcceptedRides = 0;
                user.driverProfile.reliabilityRate = 100;
                
                // Ensure vehicle type exists to avoid validation errors
                if (user.driverProfile.vehicle && !user.driverProfile.vehicle.type) {
                    // Set a default type if missing
                    user.driverProfile.vehicle.type = 'car';
                }
            }
            if (user.hitcherProfile) {
                user.hitcherProfile.totalRidesRequested = 0;
                user.hitcherProfile.completedRides = 0;
                user.hitcherProfile.cancelledAcceptedRides = 0;
                user.hitcherProfile.cancelledPendingRides = 0;
                user.hitcherProfile.reliabilityRate = 100;
            }
            await user.save();
        }
        console.log('Reliability rates initialized successfully');
        console.log('Database cleaned - ready for PESU authentication');
        return true;
    } catch (error) {
        console.error('Error initializing reliability rates:', error);
        throw error;
    }
};

module.exports = { initReliability };

