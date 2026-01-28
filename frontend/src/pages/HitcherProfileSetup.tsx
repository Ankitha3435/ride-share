import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import LoadingButton from "../components/LoadingButton";

declare global {
  interface Window {
    google: any;
  }
}

const HitcherProfileSetup: React.FC = () => {
  const { updateHitcherProfileComplete, currentUser } = useAuth();
  const navigate = useNavigate();

  // If user already has required details, complete profile and redirect
  useEffect(() => {
    const completeHitcherProfile = async () => {
      if (currentUser?.gender && currentUser?.homeAddress) {
        try {
          await api.post("/api/profile/hitcher", {
            gender: currentUser.gender,
            homeAddress: currentUser.homeAddress,
            homeCoordinates: currentUser.homeCoordinates,
            distanceToCollege: currentUser.distanceToCollege,
            hitcherProfileComplete: true,
            activeRoles: {
              driver: currentUser.activeRoles?.driver || false,
              hitcher: true,
            },
          });
          await updateHitcherProfileComplete(true);
          navigate("/hitcher/dashboard");
        } catch (error) {
          console.error("Error auto-completing hitcher profile:", error);
        }
      }
    };

    completeHitcherProfile();
  }, [currentUser, navigate, updateHitcherProfileComplete]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    homeAddress: "",
    homeCoordinates: undefined as { lat: number; lng: number } | undefined,
    gender: "",
    distanceToCollege: 0,
  });

  const addressInputRef = useRef<HTMLInputElement>(null);

  // Add these state variables to store map and marker references
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;

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

        // Initialize the map if mapRef is available
        if (mapRef.current && !map) {
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
          setMap(newMap);

          const newMarker = new google.maps.Marker({
            map: newMap,
            draggable: false,
          });
          setMarker(newMarker);
        }

        // Add the place changed event listener
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

              // Update map and marker position
              if (map && marker) {
                const position = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                };

                map.setCenter(position);
                map.setZoom(15);
                marker.setPosition(position);
                marker.setVisible(true);
              }

              // Calculate distance to college
              const collegeLocation =
                currentUser?.college === "PES University Electronic City Campus"
                  ? { lat: 12.8614567, lng: 77.6598372 }
                  : currentUser?.college === "PES University Ring Road Campus"
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
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    const distanceInKm =
                      Math.round(
                        (result.routes[0].legs[0].distance?.value || 0) / 100
                      ) / 10;

                    setFormData((prev) => ({
                      ...prev,
                      homeAddress: address,
                      homeCoordinates: origin,
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
      } catch (error: any) {
        console.error("Google Maps error:", error);
        // Silently handle Maps errors
      }
    };

    // Try to initialize immediately if Google is already loaded
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

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [map]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate all fields
    if (!formData.gender || formData.gender === "") {
      setError("Please select your gender");
      return;
    }
    if (!formData.homeAddress) {
      setError("Please enter your home address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/api/profile/hitcher", {
        ...formData,
        hitcherProfileComplete: true,
        activeRoles: {
          driver: currentUser?.activeRoles?.driver || false,
          hitcher: true,
        },
      });

      await updateHitcherProfileComplete(true);
      navigate("/hitcher/dashboard");
    } catch (error) {
      console.error("Error saving hitcher profile:", error);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has required details, show loading state
  if (currentUser?.gender && currentUser?.homeAddress) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Setting up your hitcher profile...
            </h1>
            <p className="text-gray-600 mt-2">
              Please wait while we complete your profile setup
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Hitcher Profile Setup
          </h1>
          <p className="text-gray-600">
            Complete your profile to start searching for rides
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold ml-2">
                    Personal Information
                  </h2>
                </div>

                <div className="space-y-4">
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
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MapPin className="h-6 w-6 text-green-600" />
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
                    type="text"
                    id="homeAddress"
                    name="homeAddress"
                    ref={addressInputRef}
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your home address"
                  />
                </div>

                <div
                  ref={mapRef}
                  className="border border-gray-300 rounded-md h-48 bg-gray-100 mt-4 flex items-center justify-center"
                  style={{ width: "100%" }}
                >
                  <p className="text-gray-500 text-sm">
                    📍 Map preview temporarily unavailable
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <LoadingButton
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  loadingText="Saving..."
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting
                      ? "bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Complete Profile
                </LoadingButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default HitcherProfileSetup;

