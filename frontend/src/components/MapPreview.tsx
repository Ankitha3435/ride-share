import React, { useEffect, useRef, useState, useCallback } from "react";
import { UserCircle, X } from "lucide-react";
import { getDisplayName } from "../utils/dateUtils";

// Keep track if the Maps API is already loaded
let googleMapsLoaded = false;

// Coordinate mapping for PES campuses to ensure correct locations
const CAMPUS_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  "PES University Ring Road Campus": { lat: 12.935508, lng: 77.534244 },
  "PES University Electronic City Campus": { lat: 12.861147, lng: 77.664621 },
};

// Helper function to convert location string to coordinate if it's a known campus
const getLocationForDirections = (location: string): string | google.maps.LatLng => {
  // Check if the location matches any known campus
  for (const [campusName, coords] of Object.entries(CAMPUS_COORDINATES)) {
    if (location.includes(campusName) || location.includes(campusName.replace("PES University ", ""))) {
      return new google.maps.LatLng(coords.lat, coords.lng);
    }
  }
  // Return the original location string for geocoding
  return location;
};

interface MapPreviewProps {
  startLocation: string;
  endLocation: string;
  startCoordinates?: { lat: number; lng: number }; // Optional coordinates for start location
  endCoordinates?: { lat: number; lng: number }; // Optional coordinates for end location
  userLocation?: string; // Optional user's home address or multiple addresses separated by |
  className?: string;
  direction?: "toCollege" | "fromCollege"; // Add direction prop
  onRouteCalculated?: (route: google.maps.DirectionsResult) => void;
  onWaypointsOrdered?: (orderedWaypoints: string[]) => void; // New callback for ordered waypoints
  isAcceptedLocation?: (location: string) => boolean; // New prop to check if a location is already accepted
  hitcherNames?: string[]; // Array of hitcher names matching the locations
  hitcherPhones?: string[]; // Array of hitcher phone numbers matching the locations
  hitcherFares?: number[]; // Array of fares for each hitcher
  showHitcherDetails?: boolean; // Whether to show hitcher details (name/phone) on hover
  showAddressLabels?: boolean; // Whether to show clarifying labels for addresses (for RideSearch)
}

const MapPreview: React.FC<MapPreviewProps> = ({
  startLocation,
  endLocation,
  startCoordinates,
  endCoordinates,
  userLocation,
  direction,
  className = "",
  onRouteCalculated,
  onWaypointsOrdered,
  isAcceptedLocation = () => false, // Default to false if not provided
  hitcherNames = [],
  hitcherPhones = [],
  hitcherFares = [],
  showHitcherDetails = true, // Default to true to maintain backwards compatibility
  showAddressLabels = false, // Default to false to maintain backwards compatibility
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [selectedHitcherIndex, setSelectedHitcherIndex] = useState<number | null>(null);
  const [orderedWaypoints, setOrderedWaypoints] = useState<Array<{
    location: string;
    originalIndex: number;
  }>>([]);
  
  // Memoize the waypoints callback to prevent it from changing on each render
  const stableWaypointsCallback = useCallback((orderedLocations: string[]) => {
    if (onWaypointsOrdered) {
      onWaypointsOrdered(orderedLocations);
    }
  }, [onWaypointsOrdered]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Only initialize Google Maps if it hasn't been loaded yet
    if (!window.google || !window.google.maps) {
      if (!googleMapsLoaded) {
        googleMapsLoaded = true;
        // Load Google Maps API script here if needed
        return;
      }
      return;
    }

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        zoom: 10,
        center: { lat: 12.9716, lng: 77.5946 },
        mapTypeControl: false,
        streetViewControl: false,
      });

      const renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(newMap);

      setMap(newMap);
      setDirectionsRenderer(renderer);
      
      // Clean up function
      return () => {
        if (renderer) {
          renderer.setMap(null);
        }
      };
    } catch (error: any) {
      console.error('Google Maps initialization error:', error);
      // Silently handle Maps errors
    }
  }, []);

  useEffect(() => {
    if (!map || !directionsRenderer || !startLocation || !endLocation) return;

    // Keep track of previous input to avoid unnecessary recalculations
    const coordsKey = `${startCoordinates?.lat},${startCoordinates?.lng}|${endCoordinates?.lat},${endCoordinates?.lng}`;
    const routeInputKey = `${startLocation}|${endLocation}|${userLocation || ""}|${coordsKey}`;
    const prevRouteInputKey = mapRef.current?.getAttribute('data-route-input');
    
    // Only recalculate if inputs have changed
    if (prevRouteInputKey === routeInputKey) {
      return;
    }
    
    // Store current input for future comparison
    if (mapRef.current) {
      mapRef.current.setAttribute('data-route-input', routeInputKey);
    }

    const directionsService = new google.maps.DirectionsService();

    const calculateAndDisplayRoute = () => {
      // Split userLocation into multiple waypoints if it contains |
      const waypts: google.maps.DirectionsWaypoint[] = userLocation
        ? userLocation.split("|").map(location => ({
            location: getLocationForDirections(location),
            stopover: true
          }))
        : [];

      // Use coordinates if available, otherwise use address string for geocoding
      const origin = startCoordinates 
        ? new google.maps.LatLng(startCoordinates.lat, startCoordinates.lng)
        : getLocationForDirections(startLocation);
      
      const destination = endCoordinates
        ? new google.maps.LatLng(endCoordinates.lat, endCoordinates.lng)
        : getLocationForDirections(endLocation);

      directionsService
        .route({
          origin: origin,
          destination: destination,
          waypoints: waypts,
          optimizeWaypoints: true, // This tells Google Maps to find the most efficient route
          travelMode: google.maps.TravelMode.DRIVING,
        })
        .then((response) => {
          directionsRenderer.setDirections(response);
          map.fitBounds(response.routes[0].bounds);
          
          // Store the ordered waypoints with their original indices
          if (response.routes[0] && response.routes[0].waypoint_order && userLocation) {
            const locations = userLocation.split("|");
            const waypointOrder = response.routes[0].waypoint_order;
            
            // Create an array of ordered locations with their original indices
            const ordered = waypointOrder.map((waypointIndex) => ({
              location: locations[waypointIndex],
              originalIndex: waypointIndex,
            }));
            
            setOrderedWaypoints(ordered);
            
            // Call the stable callback with the ordered waypoints
            const orderedLocations = waypointOrder.map(index => locations[index]);
            stableWaypointsCallback(orderedLocations);
          }
          
          onRouteCalculated?.(response);
        })
        .catch((e) => {
          console.error("Google Maps routing error:", e);
          // Silently handle Google Maps errors
        });
    };

    calculateAndDisplayRoute();
  }, [map, directionsRenderer, startLocation, endLocation, startCoordinates, endCoordinates, userLocation, stableWaypointsCallback, onRouteCalculated]);

  // Function to close the profile modal
  const closeProfileModal = () => {
    setSelectedHitcherIndex(null);
  };

  // Add click handler for the profile button
  const handleProfileButtonClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedHitcherIndex(index);
  };

  // Add an effect to handle clicks outside the modal
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // Only run this if the modal is open
      if (selectedHitcherIndex !== null) {
        // Check if the click was outside the modal content
        const modal = document.querySelector('.profile-modal-content');
        if (modal && !modal.contains(e.target as Node)) {
          setSelectedHitcherIndex(null);
        }
      }
    };

    // Add the click event listener to the document
    document.addEventListener('mousedown', handleOutsideClick);

    // Clean up the event listener when component unmounts or dependencies change
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedHitcherIndex]); // Only re-run if selectedHitcherIndex changes

  // Parse user locations
  const userLocations = userLocation ? userLocation.split("|") : [];
  
  // Use the ordered waypoints if available, otherwise use the original order
  const displayWaypoints = orderedWaypoints.length > 0 
    ? orderedWaypoints 
    : userLocations.map((location, index) => ({ location, originalIndex: index }));

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* Google Map */}
      <div ref={mapRef} className="h-48 w-full bg-gray-100 flex items-center justify-center">
        {(!window.google || !window.google.maps) && (
          <p className="text-gray-500 text-sm">
            📍 Map preview temporarily unavailable
          </p>
        )}
      </div>

      {/* Location details panel - increased padding and margin to prevent overlay */}
      <div className="p-4 bg-white border-t border-gray-100 mb-8">
        <div className="space-y-4">
          {/* Start Location */}
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Start
                {showAddressLabels && direction === "toCollege" && (
                  <span className="ml-1 text-xs text-gray-500">(Driver's address)</span>
                )}
              </p>
              <p className="text-sm text-gray-500 break-words">
                {startLocation}
              </p>
            </div>
          </div>
          
          

          {/* User location(s) - Now using ordered waypoints */}
          {displayWaypoints.map((waypointObj, displayIndex) => {
            const location = waypointObj.location;
            const originalIndex = waypointObj.originalIndex;
            
            return (
              <React.Fragment key={originalIndex}>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {direction === "toCollege" ? "Pickup Point" : "Dropoff Point"} #{displayIndex + 1}
                        {showAddressLabels && (
                          (direction === "toCollege" || direction === "fromCollege") ? (
                            <span className="ml-1 text-xs text-gray-500">(Your address)</span>
                          ) : null
                        )}
                      </p>
                      {isAcceptedLocation(location) && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">
                          Accepted
                        </span>
                      )}
                      
                      {/* Profile button - using originalIndex to map to the correct hitcherName */}
                      {showHitcherDetails && hitcherNames && hitcherNames.length > originalIndex && hitcherNames[originalIndex] && (
                        <div className="relative">
                          <button 
                            className="flex items-center text-blue-500 text-xs border border-blue-500 rounded px-1 py-0.5"
                            onClick={(e) => handleProfileButtonClick(e, originalIndex)}
                          >
                            <UserCircle className="h-3 w-3 mr-1" />
                            View Profile
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 break-words">
                      {location}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          

          {/* End Location */}
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Destination
                {showAddressLabels && direction === "fromCollege" && (
                  <span className="ml-1 text-xs text-gray-500">(Driver's address)</span>
                )}
              </p>
              <p className="text-sm text-gray-500 break-words">
                {endLocation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal - displays when a profile is clicked */}
      {selectedHitcherIndex !== null && hitcherNames && hitcherNames.length > selectedHitcherIndex && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="profile-modal-content bg-white rounded-lg p-4 max-w-xs w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-900 pointer-events-none">Hitcher Profile</h3>
              <button 
                onClick={closeProfileModal} 
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-900 pointer-events-none">{getDisplayName(hitcherNames[selectedHitcherIndex])}</p>
              {hitcherPhones && hitcherPhones.length > selectedHitcherIndex && (
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2 pointer-events-none">Phone:</span>
                  <a 
                    href={`tel:${hitcherPhones[selectedHitcherIndex]}`}
                    className="text-blue-600 underline hover:text-blue-800 pointer-events-auto"
                  >
                    {hitcherPhones[selectedHitcherIndex]}
                  </a>
                </div>
              )}
              {hitcherFares && hitcherFares.length > selectedHitcherIndex && (
                <div className="flex items-center pointer-events-none">
                  <span className="text-gray-500 mr-2">Fare:</span>
                  <span className="font-medium text-green-600">₹{hitcherFares[selectedHitcherIndex]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;
