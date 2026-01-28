import React from 'react';
import { Wrench, Clock } from 'lucide-react';

interface MaintenanceProps {
  message?: string;
}

const Maintenance: React.FC<MaintenanceProps> = ({ message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 opacity-20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-full">
                <Wrench className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Under Maintenance
          </h1>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-4">
              {message || "We're currently performing scheduled maintenance to improve your experience."}
            </p>
            <p className="text-base text-gray-500">
              We apologize for any inconvenience and appreciate your patience.
            </p>
          </div>

          {/* Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
              <span className="text-blue-800 font-medium">
                System will be back online shortly
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              If you need immediate assistance, please contact support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:rideshare.pesu@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for your understanding and continued support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

