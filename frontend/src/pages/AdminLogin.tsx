import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Shield, Eye, EyeOff } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in as admin, redirect to admin dashboard
    if (isAuthenticated && currentUser?.isAdmin) {
      navigate("/admin");
    }
    // If logged in as regular user, redirect to home
    if (isAuthenticated && currentUser && !currentUser.isAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }
    setIsLoggingIn(true);
    setErrorMessage("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log("Admin login response:", data);

      if (data.success && data.token) {
        // Store the token
        localStorage.setItem('authToken', data.token);
        console.log("Token stored, redirecting to /admin");
        // Force a full page reload to refresh auth state
        window.location.href = "/admin";
      } else {
        console.error("Login failed:", data);
        // Show specific error message from backend
        if (response.status === 401) {
          setErrorMessage("Invalid username or password. Please check your credentials.");
        } else {
          setErrorMessage(data.message || "Login failed. Please try again.");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMessage("Unable to connect to the server. Please try again later.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-2xl relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-900 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            RideShare Administrator Access
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4" autoComplete="off">
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Username
            </label>
            <input
              id="admin-username"
              name="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
              placeholder="Enter admin username"
              disabled={isLoggingIn}
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                name="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter admin password"
                disabled={isLoggingIn}
                required
                autoComplete="new-password"
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
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              "Login as Admin"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

