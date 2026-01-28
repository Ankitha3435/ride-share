import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { Eye, EyeOff, BookOpen } from "lucide-react";

const Login: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const location = useLocation();
  const { isAuthenticated, currentUser, getCurrentRole, loginWithPESU } = useAuth();
  const navigate = useNavigate();

  // Restore error message from localStorage (survives HMR reloads in development)
  useEffect(() => {
    const persistedError = localStorage.getItem('loginError');
    if (persistedError) {
      setErrorMessage(persistedError);
      localStorage.removeItem('loginError');
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
    
    // Check if user is an admin
    if (currentUser.isAdmin) {
      navigate("/admin");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage("");

    try {
      await loginWithPESU(username, password);
      // Navigation will be handled by the useEffect below after user state updates
    } catch (err: any) {
      // Show more specific error messages
      const errorMsg = err.message?.includes("401") || err.message?.toLowerCase().includes("invalid") || err.message?.toLowerCase().includes("credentials") || err.message?.toLowerCase().includes("does not exist")
        ? "Invalid username or password. Please check your PESU Academy credentials."
        : err.message?.toLowerCase().includes("503") || err.message?.toLowerCase().includes("authentication server")
        ? "Unable to reach PESU authentication server. Please ensure the PESU Auth server is running."
        : err.message?.toLowerCase().includes("network") || err.message?.toLowerCase().includes("connect")
        ? "Unable to connect to the server. Please check your internet connection."
        : err.message || "Login failed. Please try again.";
      
      setErrorMessage(errorMsg);
      // Persist error message to localStorage to survive HMR reloads in development
      localStorage.setItem('loginError', errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Main content */}
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl relative z-10">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src="/logo.svg" 
              alt="RideShare Logo" 
              className="h-24 w-24"
            />
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            RideShare
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Share rides with fellow students at PES University
          </p>
        </div>

        {/* Tutorial Link - Highlighted */}
        <Link
          to="/tutorial"
          className="block w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-base font-semibold text-blue-700">
              New to RideShare?
            </span>
            <span className="text-base font-semibold text-blue-700 flex items-center">
              Read our 2-minute guide <BookOpen className="h-4 w-4 ml-1.5" />
            </span>
          </div>
        </Link>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username (SRN)
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              "Login"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Login with your PESU Academy credentials
        </p>

        {/* Terms and Privacy Policy Notice */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>
            By continuing to login, you agree to our{" "}
            <Link 
              to="/terms" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Terms & Conditions
            </Link>
            {" "}and{" "}
            <Link 
              to="/privacy-policy" 
              target="_blank"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} RideShare. All rights reserved.</p>
          <p className="mt-1">Powered by <a href="https://github.com/pesu-dev/auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PESU Auth Server</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
