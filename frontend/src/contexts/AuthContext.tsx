import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import api from "../utils/api"; // Import our API utility

// Updated User interface to match the new schema
interface User {
  id: string;
  email: string;
  name: string;
  srn: string;
  college: string;
  gender: string;
  phone: string;
  homeAddress: string;
  homeCoordinates?: {
    lat: number;
    lng: number;
  };
  distanceToCollege: number;
  activeRoles: {
    driver: boolean;
    hitcher: boolean;
  };
  driverProfileComplete: boolean;
  hitcherProfileComplete: boolean;
  driverProfile: {
    isActive: boolean;
    completedTripsAsDriver: number;
    vehicle: {
      model: string;
      type: "scooter/bike" | "car" | null;
      seats: number;
    };
    pricePerKm: number;
    reliabilityRate: number;
    completedRides: number;
    totalRidesCreated: number;
    cancelledAcceptedRides: number;
    cancelledNonAcceptedRides: number;
  } | null;
  hitcherProfile: {
    isActive: boolean;
    completedTripsAsHitcher: number;
    reliabilityRate: number;
    completedRides: number;
    totalRidesRequested: number;
    cancelledAcceptedRides: number;
    cancelledPendingRides: number;
  } | null;
  isAdmin: boolean;
  isTestUser?: boolean;
  notifications?: {
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}

// Updated Ride interface to match the backend schema
export interface Ride {
  _id: string;
  driver: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    homeCoordinates?: {
      lat: number;
      lng: number;
    };
    driverProfile?: {
      reliabilityRate: number;
      vehicle?: {
        model: string;
        type?: "scooter/bike" | "car" | null;
      };
    };
  };
  hitchers?: {
    user: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      hitcherProfile?: {
        reliabilityRate: number;
      };
    };
    status: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    fare?: number;
    requestTime: string;
    autoCancel?: boolean;
  }[];
  notifications?: {
    _id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  from: string;
  to: string;
  date: string;
  direction: "toCollege" | "fromCollege";
  toCollegeTime?: string;
  fromCollegeTime?: string;
  status: string;
  availableSeats: number;
  pricePerKm?: number;
  totalFare?: number;
  vehicleType?: "scooter/bike" | "car" | null;
}

// Add BugReport interface
export interface BugReport {
  _id: string;
  reporter: string | {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  type: "bug" | "feature";
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  resolution?: string;
  resolvedBy?: string | {
    _id: string;
    name: string;
    email: string;
  };
  resolvedAt?: string;
  browser?: string;
  device?: string;
  screenshot?: string;
  reportedAt: string;
  lastUpdated: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithPESU: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateActiveRoles: (roles: {
    driver?: boolean;
    hitcher?: boolean;
  }) => Promise<void>;
  switchRole: (role: "driver" | "hitcher") => Promise<void>;
  updateDriverProfileComplete: (status: boolean) => Promise<void>;
  updateHitcherProfileComplete: (status: boolean) => Promise<void>;
  getCurrentRole: () => "driver" | "hitcher" | null;
  ride: Ride;
  setRide: React.Dispatch<React.SetStateAction<Ride>>;
  resetRide: () => void;
  allRides: Ride[];
  setAllRides: React.Dispatch<React.SetStateAction<Ride[]>>;
  fetchAllRides: () => Promise<void>;
  refreshUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allRides, setAllRides] = useState<Ride[]>([]);

  // Memoize the initial ride state based on current user
  // This is more efficient than recreating the object on every render
  const initialRideState = useMemo<Ride>(() => ({
    _id: "",
    driver: {
      _id: currentUser?.id || "",
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      gender: currentUser?.gender || "",
    },
    from: currentUser?.homeAddress || "",
    to: currentUser?.college || "",
    date: "",
    direction: "toCollege",
    toCollegeTime: "08:00",
    fromCollegeTime: "17:00",
    availableSeats: 4,
    status: "scheduled",
    hitchers: [],
    pricePerKm: undefined,
    totalFare: 0,
  }), [currentUser]);
  
  // Use the memoized initial state
  const [ride, setRide] = useState<Ride>(initialRideState);
  
  // Reset ride state when needed - using the memoized value
  const resetRide = useCallback(() => {
    setRide(initialRideState);
  }, [initialRideState]);

  // Define fetchAllRides before it's used in useEffect hooks
  const fetchAllRides = useCallback(async () => {
    try {
      const response = await api.get("/api/rides");
      setAllRides(response.data.rides);
    } catch (error) {
      console.error("Error fetching rides:", error);
      throw error;
    }
  }, []);

  // Fetch current user data from the backend
  const fetchUserData = useCallback(async () => {
    try {
      // Check for token in localStorage
      const token = getToken();
      
      // If no token is available, return null immediately
      // DON'T set user to null if already null (prevents unnecessary re-renders)
      if (!token) {
        if (currentUser !== null) {
          setCurrentUser(null);
        }
        return null;
      }
      
      // Decode token to check if it's an admin
      let payload;
      try {
        payload = JSON.parse(atob(token.split('.')[1]));
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError);
        setCurrentUser(null);
        localStorage.removeItem('authToken');
        return null;
      }
      
      // If it's an admin token, create admin user object and return early
      if (payload.isAdmin === true) {
        const adminUser = {
          id: payload.id,
          email: payload.email,
          isAdmin: true,
          name: "Admin",
          username: "admin",
          srn: "ADMIN",
          college: "PES University",
          // Set dummy values for required fields
          activeRoles: { driver: false, hitcher: false },
          driverProfileComplete: false,
          hitcherProfileComplete: false
        };
        setCurrentUser(adminUser);
        return adminUser;
      }
      
      // For regular users (including test users), fetch from profile endpoint
      const response = await api.get("/api/profile");
      const userData = response.data;
      
      // Add test user flag if present in token
      if (payload.isTestUser === true) {
        userData.isTestUser = true;
      }
      
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setCurrentUser(null);
      // Clear invalid token
      localStorage.removeItem('authToken');
      return null;
    }
  }, []);

  // useEffect to update ride state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setRide((prevRide) => ({
        ...prevRide,
        to: currentUser.college || "",
      }));
    }
  }, [currentUser]);

  // Initialize authentication state
  useEffect(() => {
    // Fetch user data if token exists
    fetchUserData()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [fetchUserData]);

  // Add a background polling mechanism to keep ride data fresh
  useEffect(() => {
    let intervalId: number | null = null;
    
    // Only set up polling if the user is logged in and has completed a profile
    if (currentUser && (currentUser.driverProfileComplete || currentUser.hitcherProfileComplete)) {
      // Set up polling every 30 seconds
      intervalId = window.setInterval(() => {
        // Check if user has been inactive for at least 1 minute
        const lastInteractionTime = localStorage.getItem('lastInteractionTime');
        if (lastInteractionTime) {
          const lastInteraction = parseInt(lastInteractionTime, 10);
          const currentTime = Date.now();
          
          // Only fetch if user has been inactive for less than a minute
          // This prevents unnecessary API calls when the user is actively using the app
          if (currentTime - lastInteraction < 60000) {
            fetchAllRides();
          }
        } else {
          // No interaction time recorded, assume user is active
          fetchAllRides();
        }
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [currentUser, fetchAllRides]);
  
  // Track user interaction to optimize background polling
  useEffect(() => {
    // Update last interaction time when component mounts
    localStorage.setItem('lastInteractionTime', Date.now().toString());
    
    // Function to update last interaction time
    const updateInteractionTime = () => {
      localStorage.setItem('lastInteractionTime', Date.now().toString());
    };
    
    // Add event listeners for user interactions
    window.addEventListener('click', updateInteractionTime);
    window.addEventListener('keydown', updateInteractionTime);
    window.addEventListener('mousemove', updateInteractionTime);
    window.addEventListener('touchstart', updateInteractionTime);
    
    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('click', updateInteractionTime);
      window.removeEventListener('keydown', updateInteractionTime);
      window.removeEventListener('mousemove', updateInteractionTime);
      window.removeEventListener('touchstart', updateInteractionTime);
    };
  }, []);

  // PESU login function
  const loginWithPESU = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password
      });

      if (response.data.success && response.data.token) {
        // Store token
        localStorage.setItem('authToken', response.data.token);
        
        // Fetch user data
        await fetchUserData();
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      // Clear any existing token but DON'T clear user state
      // (clearing user state causes RootRouteHandler to re-render Login component and lose error message)
      localStorage.removeItem('authToken');
      setLoading(false); // Set loading to false before throwing
      throw new Error(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      
      await api.post("/api/auth/logout");
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current active role
  const getCurrentRole = useCallback(() => {
    if (!currentUser) return null;
    if (currentUser.activeRoles.driver) return "driver";
    if (currentUser.activeRoles.hitcher) return "hitcher";
    return null;
  }, [currentUser]);

  // Switch to a specific role (only one role can be active at a time)
  const switchRole = useCallback(
    async (role: "driver" | "hitcher") => {
      try {
        // Prevent admin users from switching roles
        if (currentUser?.isAdmin) {
          throw new Error("Admin users cannot switch roles");
        }

        // Check if profile is complete for the selected role
        if (
          (role === "driver" && !currentUser?.driverProfileComplete) ||
          (role === "hitcher" && !currentUser?.hitcherProfileComplete)
        ) {
          throw new Error(`${role} profile is not complete`);
        }

        // Set the selected role as active and deactivate the other
        const roles = {
          driver: role === "driver",
          hitcher: role === "hitcher",
        };

        await api.put("/api/auth/active-roles", roles);

        // Fetch fresh user data
        await fetchUserData();
      } catch (error) {
        console.error("Error switching role:", error);
        throw error;
      }
    },
    [currentUser, fetchUserData]
  );

  // Update active roles (used during initial setup)
  const updateActiveRoles = useCallback(
    async (roles: { driver?: boolean; hitcher?: boolean }) => {
      try {
        // Prevent admin users from updating roles
        if (currentUser?.isAdmin) {
          throw new Error("Admin users cannot update active roles");
        }

        // Ensure only one role is active at a time
        const updatedRoles = {
          driver: false,
          hitcher: false,
          ...(roles.driver ? { driver: true, hitcher: false } : {}),
          ...(roles.hitcher ? { hitcher: true, driver: false } : {}),
        };

        await api.put("/api/auth/active-roles", updatedRoles);

        // Fetch fresh user data
        await fetchUserData();
      } catch (error) {
        console.error("Error updating active roles:", error);
        throw error;
      }
    },
    [fetchUserData, currentUser]
  );

  // Update driver profile completion status
  const updateDriverProfileComplete = useCallback(
    async (complete: boolean) => {
      try {
        await api.put("/api/auth/driver-profile-complete", { complete });

        // Fetch fresh user data
        await fetchUserData();
      } catch (error) {
        console.error("Error updating driver profile status:", error);
        throw error;
      }
    },
    [fetchUserData]
  );

  // Update hitcher profile completion status
  const updateHitcherProfileComplete = useCallback(
    async (complete: boolean) => {
      try {
        await api.put("/api/auth/hitcher-profile-complete", { complete });

        // Fetch fresh user data
        await fetchUserData();
      } catch (error) {
        console.error("Error updating hitcher profile status:", error);
        throw error;
      }
    },
    [fetchUserData]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: !!currentUser,
      loginWithPESU,
      logout,
      updateActiveRoles,
      switchRole,
      updateDriverProfileComplete,
      updateHitcherProfileComplete,
      getCurrentRole,
      ride,
      setRide,
      resetRide,
      allRides,
      setAllRides,
      fetchAllRides,
      refreshUserData: fetchUserData,
    }),
    [
      currentUser,
      loading,
      loginWithPESU,
      logout,
      updateActiveRoles,
      switchRole,
      updateDriverProfileComplete,
      updateHitcherProfileComplete,
      getCurrentRole,
      ride,
      setRide,
      resetRide,
      allRides,
      fetchAllRides,
      fetchUserData,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
