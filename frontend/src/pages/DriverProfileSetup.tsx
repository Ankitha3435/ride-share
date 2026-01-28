import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import LoadingButton from "../components/LoadingButton";

declare global {
  interface Window {
    google: any;
  }
}

interface FormData {
  vehicle: {
    model: string;
    type: "scooter/bike" | "car" | "";
    seats: number;
  };
  homeAddress: string;
  homeCoordinates?: {
    lat: number;
    lng: number;
  };
  distanceToCollege: number;
  pricePerKm: number | undefined;
  gender: string;
}

const DriverProfileSetup: React.FC = () => {
  const { updateDriverProfileComplete, currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorOpacity, setErrorOpacity] = useState(1);
  const [modelPlaceholder, setModelPlaceholder] = useState("Honda City");
  const [modelOpacity, setModelOpacity] = useState(1);

  // Start from step 1 (vehicle) if personal details exist
  const [currentStep, setCurrentStep] = useState(
    currentUser?.gender && currentUser?.homeAddress ? 1 : 0
  );

  const [formData, setFormData] = useState<FormData>({
    vehicle: {
      model: "",
      type: "",
      seats: 4,
    },
    homeAddress: currentUser?.homeAddress || "",
    homeCoordinates: currentUser?.homeCoordinates || undefined,
    distanceToCollege: currentUser?.distanceToCollege || 0,
    pricePerKm: undefined,
    gender: currentUser?.gender || "",
  });

  const addressInputRef = useRef<HTMLInputElement>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

    // Only initialize when on the location step
    if (currentStep === 2) {
      const initAutocomplete = () => {
      if (!addressInputRef.current || !window.google?.maps?.places) {
        return;
      }

        try {
          autocomplete = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              componentRestrictions: { country: "IN" },
              fields: ["formatted_address", "geometry", "name", "types"],
              types: ["geocode", "establishment"],
            }
          );

          if (mapRef.current) {
            const centerCoordinates =
              currentUser?.college === "PES University Electronic City Campus"
                ? { lat: 12.8614567, lng: 77.6598372 }
                : currentUser?.college === "PES University Ring Road Campus"
                ? { lat: 12.9350592, lng: 77.535673 }
                : { lat: 12.8614567, lng: 77.6598372 };

            const newMap = new google.maps.Map(mapRef.current, {
              center: centerCoordinates,
              zoom: 12,
              mapTypeControl: false,
            });

            const newMarker = new google.maps.Marker({
              map: newMap,
              draggable: false,
              visible: false,
            });

            setMap(newMap);
            setMarker(newMarker);

            if (autocomplete) {
              autocomplete.addListener("place_changed", () => {
                const place = autocomplete?.getPlace();
                let address = "";

                if (place && place.geometry && place.geometry.location) {
                  if (place.formatted_address) {
                    address = place.name
                      ? `${place.name}, ${place.formatted_address}`
                      : place.formatted_address;
                  }

                  const position = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  };

                  newMap.setCenter(position);
                  newMap.setZoom(15);
                  newMarker.setPosition(position);
                  newMarker.setVisible(true);

                  const collegeLocation =
                    currentUser?.college ===
                    "PES University Electronic City Campus"
                      ? { lat: 12.8614567, lng: 77.6598372 }
                      : currentUser?.college ===
                        "PES University Ring Road Campus"
                      ? { lat: 12.9350592, lng: 77.535673 }
                      : { lat: 12.8614567, lng: 77.6598372 };
                  const origin = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  };

                  const directionsService = new google.maps.DirectionsService();
                  directionsService.route(
                    {
                      origin: origin,
                      destination: collegeLocation,
                      travelMode: google.maps.TravelMode.DRIVING,
                    },
                    (result, status) => {
                      if (
                        status === google.maps.DirectionsStatus.OK &&
                        result
                      ) {
                        const distanceInKm =
                          Math.round(
                            (result.routes[0].legs[0].distance?.value || 0) /
                              100
                          ) / 10;

                        setFormData((prev) => ({
                          ...prev,
                          homeAddress: address,
                          homeCoordinates: position,
                          distanceToCollege: distanceInKm,
                        }));
                      } else {
                        console.error("Error calculating distance:", status);
                      }
                    }
                  );
                }
              });
            }
          }
        } catch (error: any) {
          console.error("Google Maps error:", error);
          // Silently handle Maps errors
        }
      };

      if (window.google?.maps?.places) {
        initAutocomplete();
      } else {
        const checkGoogleExists = setInterval(() => {
          if (window.google?.maps?.places) {
            initAutocomplete();
            clearInterval(checkGoogleExists);
          }
        }, 100);

        // Silently fail after 10 seconds
        setTimeout(() => {
          clearInterval(checkGoogleExists);
        }, 10000);
      }
    }

    return () => {
      if (autocomplete && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [currentStep]);

  // Vehicle model placeholder animation
  useEffect(() => {
    if (currentStep !== 1) return;

    const modelOptions = ["Honda City", "Hyundai Venue",  "Honda Activa", "Royal Enfield Meteor"];
    let currentIndex = 0;
    let fadeTimer: number;

    const modelInterval = window.setInterval(() => {
      setModelOpacity(0);

      fadeTimer = window.setTimeout(() => {
        currentIndex = (currentIndex + 1) % modelOptions.length;
        setModelPlaceholder(modelOptions[currentIndex]);
        setModelOpacity(1);
      }, 300);
    }, 2500);

    return () => {
      clearInterval(modelInterval);
      clearTimeout(fadeTimer);
    };
  }, [currentStep]);

  // Handle vehicle type change to adjust seats and pricing
  const handleVehicleTypeChange = (type: "scooter/bike" | "car" | "") => {
    setFormData((prev) => {
      let newSeats = prev.vehicle.seats;
      let newPrice = prev.pricePerKm;

      // For scooter/bike, set seats to 1 and suggest price around 3-4
      if (type === "scooter/bike") {
        newSeats = 1;
        // Suggest 4 as default for scooter/bike
        if (newPrice === undefined) {
          newPrice = 4;
        }
      } else if (type === "car") {
        // For car, default to 4 seats if currently 1
        if (prev.vehicle.seats === 1) {
          newSeats = 4;
        }
        // Suggest 5 as default for car
        if (newPrice === undefined) {
          newPrice = 5;
        }
      }

      return {
        ...prev,
        vehicle: {
          ...prev.vehicle,
          type: type,
          seats: newSeats,
        },
        pricePerKm: newPrice,
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("vehicle.")) {
      const vehicleField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          [vehicleField]: vehicleField === "seats" ? Number(value) : value,
        },
      }));
    } else if (name === "pricePerKm") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };

  const showError = (message: string) => {
    setErrorOpacity(1);
    setError(message);

    setTimeout(() => {
      setErrorOpacity(0);
      setTimeout(() => {
        setError(null);
        setErrorOpacity(1);
      }, 500);
    }, 3000);
  };

  const nextStep = () => {
    if (currentStep === 0) {
      // Validate gender
      if (!formData.gender) {
        showError("Please select your gender.");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Validate vehicle information
      if (
        !formData.vehicle.model ||
        !formData.vehicle.type ||
        !formData.vehicle.seats
      ) {
        showError("Please fill all required fields.");
        return;
      }

      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate home address
      if (!formData.homeAddress || formData.distanceToCollege === 0) {
        showError(
          "Please enter your home address and ensure distance is calculated."
        );
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate gender
    if (!formData.gender || formData.gender === "") {
      showError("Please select your gender");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate vehicle information
    if (!formData.vehicle.model || formData.vehicle.model.trim() === "") {
      showError("Please enter your vehicle model");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.vehicle.type) {
      showError("Please select your vehicle type");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate home address
    if (!formData.homeAddress || formData.homeAddress.trim() === "") {
      showError("Please enter your home address");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate price per km
    if (formData.pricePerKm === undefined || isNaN(formData.pricePerKm)) {
      showError("Please enter a valid price per kilometer");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate price range (same for all vehicle types)
    if (formData.pricePerKm < 1 || formData.pricePerKm > 10) {
      showError("Price per kilometer must be between ₹1 and ₹10");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const driverProfileData = {
        gender: formData.gender,
        homeAddress: formData.homeAddress,
        homeCoordinates: formData.homeCoordinates,
        distanceToCollege: formData.distanceToCollege,
        driverProfile: {
          vehicle: formData.vehicle,
          pricePerKm: formData.pricePerKm,
        },
        driverProfileComplete: true,
        activeRoles: {
          driver: true,
          hitcher: currentUser?.activeRoles?.hitcher || false,
        },
      };

      await api.post("/api/profile/driver", driverProfileData);

      await updateDriverProfileComplete(true);
      navigate("/driver/dashboard");
    } catch (error) {
      console.error("Error saving driver profile:", error);
      showError("Failed to save profile. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = () => {
    if (!error) return null;
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        style={{
          transition: "opacity 0.5s ease-in-out",
          opacity: errorOpacity,
        }}
      >
        {error}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Driver Profile Setup
          </h1>
          <p className="text-gray-600">
            Complete your profile to start offering rides
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {!currentUser?.gender && (
              <>
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= 0 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= 0
                        ? "border-blue-600 bg-gradient-to-r from-blue-100 to-indigo-100"
                        : "border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <span className="text-xs mt-1">Personal</span>
                </div>
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep >= 1
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700"
                      : "bg-gray-200"
                  }`}
                ></div>
              </>
            )}

            <div
              className={`flex flex-col items-center ${
                currentStep >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 1
                    ? "border-blue-600 bg-gradient-to-r from-blue-100 to-indigo-100"
                    : "border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="text-xs mt-1">Vehicle</span>
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 2
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700"
                  : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                currentStep >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 2
                    ? "border-blue-600 bg-gradient-to-r from-blue-100 to-indigo-100"
                    : "border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">3</span>
              </div>
              <span className="text-xs mt-1">Location</span>
            </div>
            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep >= 3
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700"
                  : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex flex-col items-center ${
                currentStep >= 3 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 3
                    ? "border-blue-600 bg-gradient-to-r from-blue-100 to-indigo-100"
                    : "border-gray-300"
                }`}
              >
                <span className="text-sm font-medium">4</span>
              </div>
              <span className="text-xs mt-1">Pricing</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <ErrorMessage />
          <form onSubmit={(e) => handleSubmit(e)}>
            {/* Step 0: Personal Information (Gender) */}
            {currentStep === 0 && !currentUser?.gender && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold ml-2">
                    Personal Information
                  </h2>
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Vehicle Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold ml-2">
                    Vehicle Information
                  </h2>
                </div>

                <div>
                  <label
                    htmlFor="vehicleType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Vehicle Type
                  </label>
                  <select
                    id="vehicleType"
                    name="vehicle.type"
                    value={formData.vehicle.type}
                    onChange={(e) => handleVehicleTypeChange(e.target.value as "scooter/bike" | "car" | "")}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select vehicle type</option>
                    <option value="scooter/bike">Scooter/Bike</option>
                    <option value="car">Car</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.vehicle.type === "scooter/bike" 
                      ? "Two-wheelers can carry 1 passenger only" 
                      : formData.vehicle.type === "car"
                      ? "You can choose number of seats for cars"
                      : "Choose your vehicle type"}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="vehicleModel"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicle.model"
                    value={formData.vehicle.model}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={modelPlaceholder}
                    style={{
                      transition: "opacity 0.3s ease-in-out",
                      opacity: formData.vehicle.model
                        ? 1
                        : modelOpacity,
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="seats"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Available Seats
                  </label>
                  {formData.vehicle.type === "scooter/bike" ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                      1
                    </div>
                  ) : (
                    <select
                      id="seats"
                      name="vehicle.seats"
                      value={formData.vehicle.seats}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  {!currentUser?.gender && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={nextStep}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      !currentUser?.gender ? "" : "ml-auto"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold ml-2">Your Location</h2>
                </div>

                <div>
                  <label
                    htmlFor="homeAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Home Address
                  </label>
                  <input
                    ref={addressInputRef}
                    type="text"
                    id="homeAddress"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start typing your address..."
                  />
                </div>

                <div
                  ref={mapRef}
                  className="border border-gray-300 rounded-md bg-gray-100 mt-4 flex items-center justify-center"
                  style={{ width: "100%", height: "300px" }}
                >
                  <p className="text-gray-500 text-sm">
                    📍 Map preview temporarily unavailable
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold ml-2">Pricing</h2>
                </div>

                <div>
                  <label
                    htmlFor="pricePerKm"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price per Km (₹)
                  </label>
                  <input
                    type="number"
                    id="pricePerKm"
                    name="pricePerKm"
                    value={
                      formData.pricePerKm === undefined
                        ? ""
                        : formData.pricePerKm
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      
                      if (
                        e.target.value === "" ||
                        (value >= 1 && value <= 10)
                      ) {
                        handleInputChange(e);
                      } else {
                        handleInputChange(e);
                        showError("Price per kilometer must be between ₹1 and ₹10");
                      }
                    }}
                    required
                    min="1"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter price per Km"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This is the price each passenger will pay per Km of travel.
                    You can adjust this price later.
                    <br />
                    {formData.vehicle.type === "scooter/bike" ? (
                      <>
                        Recommended for scooter/bike:{" "}
                        <span className="font-bold text-green-500">₹3</span> to{" "}
                        <span className="font-bold text-red-500">₹4</span>
                      </>
                    ) : (
                      <>
                        Recommended for car:{" "}
                        <span className="font-bold text-green-500">₹5</span> to{" "}
                        <span className="font-bold text-red-500">₹7</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">
                        Ready to go!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your profile is almost complete.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between gap-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                  <LoadingButton
                    onClick={() => handleSubmit()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                    loadingText="Saving Profile..."
                  >
                    Save Profile
                  </LoadingButton>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default DriverProfileSetup;

