import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Users, MapPin, Calendar, CheckCircle, ChevronDown, ChevronUp, Mail } from "lucide-react";

const Tutorial: React.FC = () => {
  const [isDriverOpen, setIsDriverOpen] = useState(false);
  const [isHitcherOpen, setIsHitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="RideShare Logo" className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How to Use RideShare
          </h1>
        </div>

        {/* Brief Intro */}
        <div className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            What is it?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            RideShare is a carpooling platform exclusively for PES University students. 
            Whether you own a vehicle or need a ride, RideShare connects you with fellow 
            students traveling to and from campus. Save money, reduce traffic, and make 
            your commute more convenient!
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* I own a vehicle */}
          <div className="border-2 border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
            <button
              onClick={() => setIsDriverOpen(!isDriverOpen)}
              className="w-full flex items-center justify-between p-6 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-full">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 ml-3">
                  I own a vehicle
                </h3>
              </div>
              {isDriverOpen ? (
                <ChevronUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-6 w-6 text-blue-600 flex-shrink-0" />
              )}
            </button>
            
            {isDriverOpen && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      1
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Select "Driver"</span> role and complete your profile 
                        (vehicle details, pricing)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      2
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Create a ride</span> by selecting your preset route, 
                        date, time, and available seats
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      3
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Wait for requests</span> from hitchers. 
                        Accept or reject based on your preference
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      4
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">View accepted hitchers</span> in your ride card. 
                        Contact them to coordinate pickup
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      5
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Complete the ride</span> and collect payment. 
                        Your reliability rating will be updated
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-300 space-y-3">
                  <p className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-600 mr-2 flex-shrink-0 mt-0.5 font-semibold">₹</span>
                    <span>
                      <strong>Pricing:</strong> Set your price per km per passenger (recommended: ₹3-₹5 for bikes, ₹5-₹7 for cars). 
                      Total fare is calculated automatically
                    </span>
                  </p>
                  
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 mt-3 border border-blue-200">
                    <p className="text-sm text-gray-800 mb-2">
                      <strong>📊 Pricing Example:</strong>
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      You'll get paid depending on the distance of your passenger's address to college and the price you set per km of travel. 
                      For instance, if you live 13 km from college and set your price per km to ₹6, and had 3 passengers with distances of 8, 10, and 12 km from college, 
                      they'd pay you <strong>₹48, ₹60, and ₹72</strong> respectively — totaling <strong className="text-blue-700">₹180 one way</strong>. 
                      That's potentially <strong className="text-blue-700">₹360 per day</strong> (assuming both ways)! 
                      The hitchers also pay a lesser price (sometimes significantly), so it's a <strong>win-win situation for both parties</strong>! 🎉
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 flex items-start">
                    <Mail className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Stay Updated:</strong> You'll receive email notifications when hitchers request rides, 
                      and when they cancel
                    </span>
                  </p>
                  <div className="bg-blue-100 rounded p-3 mt-3">
                    <p className="text-xs text-gray-700">
                      <strong>💡 Driver Tips:</strong>
                    </p>
                    <ul className="text-xs text-gray-700 mt-2 space-y-1 ml-4">
                      <li>• You can change your vehicle type and pricing anytime</li>
                      <li>• Cancelling rides affects your reliability rating - only cancel if absolutely necessary</li>
                      <li>• Always coordinate with hitchers before the ride for smooth pickup</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* I need rides */}
          <div className="border-2 border-green-200 rounded-lg bg-green-50 overflow-hidden">
            <button
              onClick={() => setIsHitcherOpen(!isHitcherOpen)}
              className="w-full flex items-center justify-between p-6 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 ml-3">
                  I need rides to and from campus
                </h3>
              </div>
              {isHitcherOpen ? (
                <ChevronUp className="h-6 w-6 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-6 w-6 text-green-600 flex-shrink-0" />
              )}
            </button>
            
            {isHitcherOpen && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      1
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Select "Hitcher"</span> role and complete your profile 
                        (phone number, campus)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      2
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Search for rides</span> by entering your pickup location, 
                        destination, and travel date
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      3
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Browse available rides</span> and view route, 
                        fare, and driver details
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      4
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Send a request</span> to the driver. 
                        Wait for them to accept your request
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-semibold">
                      5
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Once accepted</span>, you'll receive an email with 
                        driver contact details. Coordinate pickup and enjoy your ride!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-green-300 space-y-3">
                  <p className="text-sm text-gray-600 flex items-start">
                    <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5 font-semibold">₹</span>
                    <span>
                      <strong>Payment:</strong> Pay the driver directly in cash or UPI after the ride. 
                      The fare is shown before you make the ride request
                    </span>
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 mt-3 border border-green-200">
                    <p className="text-sm text-gray-800 mb-2">
                      <strong>💰 Cost Savings Example:</strong>
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      RideShare helps you save significantly on commute costs! For instance, if you live 10 km from college, 
                      a typical auto/cab ride might cost you <strong>₹150-200</strong>. With RideShare, you'd pay only <strong className="text-green-700">₹60</strong> 
                      (at ₹6/km) — that's <strong>less than half the cost</strong>! Plus, you're traveling with fellow PESU students in a safe, verified community. 💚
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 flex items-start">
                    <Mail className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Stay Updated:</strong> You'll receive email notifications when drivers accept or reject your requests, 
                      and for any ride updates
                    </span>
                  </p>
                  <div className="bg-green-100 rounded p-3 mt-3">
                    <p className="text-xs text-gray-700">
                      <strong>💡 Hitcher Tips:</strong>
                    </p>
                    <ul className="text-xs text-gray-700 mt-2 space-y-1 ml-4">
                      <li>• You can switch to driver role anytime in your profile settings</li>
                      <li>• Cancelling rides affects your reliability rating - only cancel if absolutely necessary</li>
                      <li>• Always coordinate with your driver before the ride for smooth pickup</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-10 bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ✨ Key Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Route Visualization</p>
                <p className="text-sm text-gray-600">View exact routes on Google Maps before booking</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Flexible Scheduling</p>
                <p className="text-sm text-gray-600">Plan rides up to 7 days in advance</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Reliability Ratings</p>
                <p className="text-sm text-gray-600">Build trust through consistent ride completion</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">PESU Students Only</p>
                <p className="text-sm text-gray-600">Safe and verified community using PESU Academy login</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Stay updated with ride requests, acceptances, and cancellations</p>
              </div>
            </div>
            <div className="flex items-start">
              <Car className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Dual Role Support</p>
                <p className="text-sm text-gray-600">Be both a driver and hitcher - switch roles anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* General Tips */}
        <div className="mb-10 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            💡 General Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span><strong>Switch roles anytime:</strong> You can be both a driver and hitcher. Toggle between roles in your profile settings</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <span><strong>Email notifications:</strong> Check your email regularly for ride updates, requests, and confirmations</span>
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Get Started with RideShare
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Questions or issues? <br/> Use the "Report an Issue" feature in the app or contact us at <a href="mailto:rideshare.pesu@gmail.com" className="text-blue-600 hover:underline">rideshare.pesu@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

