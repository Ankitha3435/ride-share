import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff, FlaskConical } from "lucide-react";
import api from "../utils/api";

const TestLogin: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const { isAuthenticated, currentUser, getCurrentRole } = useAuth();
  const navigate = useNavigate();

  // Restore error message from localStorage (survives HMR reloads in development)
  useEffect(() => {
    const persistedError = localStorage.getItem('testLoginError');
    if (persistedError) {
      setErrorMessage(persistedError);
      localStorage.removeItem('testLoginError');
    }
  }, []);

  useEffect(() => {
    // Check for error parameters in the URL
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error === "auth-failed") {
      setErrorMessage("Authentication failed. Please check your credentials.");
    }

    // Optionally clear the URL parameter after reading it
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    // Don't navigate if:
    // 1. There's an error message (failed login)
    // 2. Currently logging in (async operation in progress)
    // 3. Not authenticated
    if (!isAuthenticated || !currentUser || errorMessage || isLoggingIn) {
      return;
    }

    // Check if user has any active roles
    const hasActiveRoles =
      currentUser.activeRoles?.driver || currentUser.activeRoles?.hitcher;

    // If no active roles, redirect to role selection
    if (!hasActiveRoles) {
      navigate("/role-selection");
      return;
    }

    // Get the current active role
    const currentRole = getCurrentRole();

    // Redirect based on active role and profile completion status
    if (currentRole === "driver") {
      if (currentUser.driverProfileComplete) {
        navigate("/driver/dashboard");
      } else {
        navigate("/driver/setup");
      }
    } else if (currentRole === "hitcher") {
      if (currentUser.hitcherProfileComplete) {
        navigate("/hitcher/dashboard");
      } else {
        navigate("/hitcher/setup");
      }
    } else {
      // Fallback if no role is active
      navigate("/role-selection");
    }
  }, [isAuthenticated, currentUser, errorMessage, isLoggingIn, navigate, getCurrentRole]);

  const handleTestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage("");

    try {
      const response = await api.post("/api/auth/test/login", {
        username,
        password
      });

      if (response.data.success && response.data.token) {
        // Store token
        localStorage.setItem('authToken', response.data.token);
        
        // Reload the page to trigger auth context refresh
        window.location.href = '/';
      } else {
        throw new Error(response.data.message || "Test login failed");
      }
    } catch (err: any) {
      // Show more specific error messages
      const errorMsg = err.response?.data?.message || 
        err.message?.includes("401") || err.message?.toLowerCase().includes("invalid") || err.message?.toLowerCase().includes("credentials") || err.message?.toLowerCase().includes("does not exist")
        ? "Invalid username or password. Please check your PESU Academy credentials."
        : err.message?.toLowerCase().includes("403") || err.message?.toLowerCase().includes("access denied")
        ? "Access denied. Only authorized test users can use this endpoint."
        : err.message?.toLowerCase().includes("503") || err.message?.toLowerCase().includes("authentication server")
        ? "Unable to reach PESU authentication server. Please ensure the PESU Auth server is running."
        : err.message?.toLowerCase().includes("network") || err.message?.toLowerCase().includes("connect")
        ? "Unable to connect to the server. Please check your internet connection."
        : err.message || "Test login failed. Please try again.";
      
      setErrorMessage(errorMsg);
      // Persist error message to localStorage to survive HMR reloads in development
      localStorage.setItem('testLoginError', errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Main content */}
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl relative z-10 border-2 border-purple-200">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center">
              <FlaskConical className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            Test User Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Restricted access for authorized test users only
          </p>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-md p-3">
            <p className="text-xs text-purple-800 font-medium">
              🧪 This endpoint is for testing purposes only
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Test users can bypass maintenance mode
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleTestLogin(e); }} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username (SRN)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter your SRN"
              disabled={isLoggingIn}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
                disabled={isLoggingIn}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Test Login"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            to="/login" 
            className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
          >
            ← Back to regular login
          </Link>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} RideShare. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;

