const mongoose = require("mongoose");

const MaintenanceModeSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "We're currently performing scheduled maintenance. We'll be back shortly!",
  },
  enabledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  enabledAt: {
    type: Date,
  },
  disabledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Ensure only one document exists
MaintenanceModeSchema.statics.getInstance = async function() {
  let instance = await this.findOne();
  if (!instance) {
    instance = await this.create({
      isActive: false,
    });
  }
  return instance;
};

const MaintenanceMode = mongoose.model("MaintenanceMode", MaintenanceModeSchema);

module.exports = MaintenanceMode;

