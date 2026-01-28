import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, MapPin, Edit, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import api from "../utils/api"; // Import API utility

const RoleDetails: React.FC = () => {
  const { currentUser, refreshUserData, allRides } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    vehicleModel: "",
    vehicleType: "",
    seats: "",
    pricePerKm: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Check if driver has upcoming rides
  const hasUpcomingRides = () => {
    if (!currentUser) return false;
    
    const now = new Date();
    const driverUpcomingRides = allRides.filter(ride => {
      if (ride.driver._id !== currentUser.id) return false;
      if (ride.status === "cancelled" || ride.status === "completed") return false;
      
      const rideDate = new Date(ride.date);
      const timeString = ride.direction === "toCollege" 
        ? ride.toCollegeTime 
        : ride.fromCollegeTime;
      
      if (timeString) {
        const [hours, minutes] = timeString.split(":").map(Number);
        rideDate.setHours(hours, minutes, 0, 0);
      }
      
      return rideDate >= now || ride.status === "in-progress";
    });
    
    return driverUpcomingRides.length > 0;
  };

  // Initialize edit form data when edit mode is activated
  const handleEditClick = () => {
    if (currentUser?.driverProfile) {
      setEditedData({
        vehicleModel: currentUser.driverProfile.vehicle.model,
        vehicleType: currentUser.driverProfile.vehicle.type,
        seats: currentUser.driverProfile.vehicle.seats.toString(),
        pricePerKm: currentUser.driverProfile.pricePerKm.toString()
      });
      setIsEditing(true);
    }
  };

  // Handle input changes in edit form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error when field is edited
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[name];
      return newErrors;
    });

    if (name === 'vehicleType') {
      // When vehicle type changes, adjust seats and price per km accordingly
      const newSeats = value === 'scooter/bike' ? '1' : '4';
      const newPricePerKm = value === 'scooter/bike' ? '4' : '6';
      setEditedData(prev => ({
        ...prev,
        vehicleType: value,
        seats: newSeats,
        pricePerKm: newPricePerKm
      }));
    } else if (name === 'seats') {
      // Validate seats (must be a number between 1 and 6)
      const numValue = value === '' ? '' : parseInt(value);
      if (numValue !== '' && numValue > 6) {
        setValidationErrors(prev => ({
          ...prev,
          seats: 'Maximum 6 seats allowed'
        }));
      }
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Only validate vehicle details if driver doesn't have upcoming rides
    if (!hasUpcomingRides()) {
      if (!editedData.vehicleModel.trim()) {
        errors.vehicleModel = 'Vehicle model is required';
      }
      
      if (editedData.seats === '') {
        errors.seats = 'Number of seats is required';
      } else {
        const numSeats = parseInt(editedData.seats);
        if (isNaN(numSeats) || numSeats < 1) {
          errors.seats = 'Number of seats must be at least 1';
        } else if (numSeats > 6) {
          errors.seats = 'Maximum 6 seats allowed';
        }
      }
    }
    
    // Always validate price per km
    if (editedData.pricePerKm === '') {
      errors.pricePerKm = 'Price per km is required';
    } else {
      const price = parseFloat(editedData.pricePerKm);
      if (isNaN(price) || price < 1) {
        errors.pricePerKm = 'Price must be at least ₹1';
      } else if (price > 10) {
        errors.pricePerKm = 'Price cannot exceed ₹10';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save updated driver profile
  const handleSaveClick = async () => {
    if (!validateForm()) {
      setNotification({
        show: true,
        message: "Please fix the errors in the form",
        type: "error"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare update payload based on whether driver has upcoming rides
      const updatePayload: any = {
        pricePerKm: parseFloat(editedData.pricePerKm)
      };
      
      // Only include vehicle details if driver doesn't have upcoming rides
      if (!hasUpcomingRides()) {
        updatePayload.vehicle = {
          model: editedData.vehicleModel,
          type: editedData.vehicleType,
          seats: parseInt(editedData.seats)
        };
      }
      
      await api.post("/api/profile/driver/update", updatePayload);

      // Refresh user data to get updated profile
      await refreshUserData();
      
      const message = hasUpcomingRides() 
        ? "Price per km updated successfully (vehicle details unchanged due to upcoming rides)"
        : "Driver profile updated successfully";
      
      setNotification({
        show: true,
        message: message,
        type: "success"
      });
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating driver profile:", error);
      setNotification({
        show: true,
        message: "Failed to update driver profile",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-dismiss notification after 3 seconds
  React.useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderDriverDetails = (currentUser: any) => {
    if (!currentUser.driverProfileComplete) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Complete your driver profile to view this section.
          </p>
          <button
            onClick={() => navigate("/driver/setup")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Profile
          </button>
        </div>
      );
    }
    const driverProfile = currentUser.driverProfile;
    if (!driverProfile) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4 justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold ml-2">Driver Details</h2>
          </div>
          
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Details
            </button>
          ) : (
            <button
              onClick={handleSaveClick}
              disabled={isSubmitting}
              className={`flex items-center ${
                isSubmitting 
                  ? "text-gray-400" 
                  : "text-green-600 hover:text-green-800"
              }`}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {/* Notification Toast */}
        {notification.show && (
          <div
            className={`px-4 py-2 rounded-md shadow-lg ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            } transition-all duration-300`}
          >
            <span>{notification.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Vehicle Information
              </h3>
              {!isEditing ? (
                <>
                  <p className="mt-1">Model: {driverProfile.vehicle.model}</p>
                  <p>Type: {driverProfile.vehicle.type === "scooter/bike" ? "Scooter/Bike" : "Car"}</p>
                  <p>Available Seats: {driverProfile.vehicle.seats}</p>
                </>
              ) : (
                <div className="mt-2 space-y-3">
                  {hasUpcomingRides() && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        Vehicle details cannot be changed while you have upcoming rides. You can still update the price per km for future rides.
                      </p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="vehicleType" className="block text-xs text-gray-600">
                      Vehicle Type
                    </label>
                    <select
                      id="vehicleType"
                      name="vehicleType"
                      value={editedData.vehicleType}
                      onChange={handleInputChange}
                      disabled={hasUpcomingRides()}
                      className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasUpcomingRides() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                      <option value="car">Car</option>
                      <option value="scooter/bike">Scooter/Bike</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vehicleModel" className="block text-xs text-gray-600">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      id="vehicleModel"
                      name="vehicleModel"
                      value={editedData.vehicleModel}
                      onChange={handleInputChange}
                      disabled={hasUpcomingRides()}
                      className={`mt-1 block w-full px-3 py-2 border ${validationErrors.vehicleModel ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasUpcomingRides() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="e.g. Honda Civic"
                    />
                    {validationErrors.vehicleModel && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.vehicleModel}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="seats" className="block text-xs text-gray-600">
                      Available Seats {editedData.vehicleType === "scooter/bike" ? "" : "(Max: 6)"}
                    </label>
                    {editedData.vehicleType === "scooter/bike" ? (
                      <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                        1
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          id="seats"
                          name="seats"
                          min="1"
                          max="6"
                          value={editedData.seats}
                          onChange={handleInputChange}
                          disabled={hasUpcomingRides()}
                          className={`mt-1 block w-full px-3 py-2 border ${validationErrors.seats ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${hasUpcomingRides() ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                        {validationErrors.seats && (
                          <p className="mt-1 text-xs text-red-600">{validationErrors.seats}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Pricing</h3>
              {!isEditing ? (
                <p className="mt-1">Price per Km: ₹{driverProfile.pricePerKm}</p>
              ) : (
                <div className="mt-2">
                  <label htmlFor="pricePerKm" className="block text-xs text-gray-600">
                    Price per Km (₹)
                  </label>
                  <input
                    type="number"
                    id="pricePerKm"
                    name="pricePerKm"
                    min="1"
                    max="10"
                    step="0.5"
                    value={editedData.pricePerKm}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.pricePerKm ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {validationErrors.pricePerKm ? (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.pricePerKm}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">Price must be between ₹1 and ₹10 per kilometer</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Statistics</h3>
              <p className="mt-1">
                Completed Trips: {driverProfile.completedRides}
              </p>
              <p>
                Reliability Rate: {driverProfile.reliabilityRate}%
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Personal Details
              </h3>
              <p className="mt-1">
                Gender: {currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1)}
              </p>
              <p>
                Phone: {currentUser.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHitcherDetails = (currentUser: any) => {
    if (!currentUser.hitcherProfileComplete) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">
            Complete your hitcher profile to view this section.
          </p>
          <button
            onClick={() => navigate("/hitcher/setup")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Profile
          </button>
        </div>
      );
    }
    const hitcherProfile = currentUser.hitcherProfile;
    if (!hitcherProfile) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold ml-2">Hitcher Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Statistics</h3>
            <p className="mt-1">
              Completed Trips: {hitcherProfile.completedRides}
            </p>
            <p>
              Reliability Rate: {hitcherProfile.reliabilityRate}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p>Please log in to view your role details.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/profile/settings")}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md shadow-sm hover:opacity-90 transition-all mb-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </button>

        <div className="bg-white shadow-md rounded-lg p-6">
          {currentUser.activeRoles.driver
            ? renderDriverDetails(currentUser)
            : renderHitcherDetails(currentUser)}
        </div>
      </div>
    </>
  );
};

export default RoleDetails;
