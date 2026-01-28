import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/profile/settings"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-md shadow-sm hover:opacity-90 transition-all mb-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>

          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Last Updated: 23/10/2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p>
              Welcome to RideShare ("we," "our," or "us"). These Terms and Conditions govern your use of the RideShare application and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Definitions</h2>
            <p><strong>"User"</strong>: Any individual who accesses or uses the Service, including Drivers and Hitchhikers.</p>
            <p><strong>"Driver"</strong>: A User who offers rides through the Service.</p>
            <p><strong>"Hitchhiker"</strong>: A User who requests or accepts rides through the Service.</p>
            <p><strong>"Ride"</strong>: The transportation service provided by a Driver to a Hitchhiker.</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Eligibility</h2>
            <p>To use the Service, you must:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Be at least 18 years of age</li>
              <li>Be a PES University student with valid PESU Academy login credentials (SRN and password)</li>
              <li>If registering as a Driver, possess a valid Indian driving license and vehicle registration documentation</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Not be prohibited from receiving services under applicable laws</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Account Registration</h2>
            <p>
              You must register for an account using your PESU Academy credentials (SRN and password). Authentication is handled through PESU Academy's official authentication system. You agree to maintain the confidentiality of your account information and are fully responsible for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. User Obligations</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 General Obligations</h3>
            <p>Users shall:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Comply with all applicable laws and regulations</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not engage in any activity that may harm, disrupt, or interfere with the Service</li>
              <li>Not attempt to gain unauthorized access to any part of the Service</li>
              <li>Not use the Service for commercial purposes</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">5.2 Driver Obligations</h3>
            <p>Drivers shall:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintain a valid driving license and vehicle registration</li>
              <li>Maintain appropriate insurance coverage as required by law</li>
              <li>Specify accurate vehicle type (scooter/bike or car) during profile setup</li>
              <li>Ensure their vehicle is in safe operating condition</li>
              <li>Not consume alcohol or drugs before or during a Ride</li>
              <li>Drive safely and comply with all traffic rules and regulations</li>
              <li>Treat Hitchhikers with respect and courtesy</li>
              <li>Arrive at the agreed pickup location on time</li>
              <li>Follow the agreed-upon route unless mutually agreed otherwise</li>
              <li>For scooter/bike riders: carry only 1 passenger as per platform requirements</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">5.3 Hitchhiker Obligations</h3>
            <p>Hitchhikers shall:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Be at the agreed pickup location on time</li>
              <li>Treat Drivers with respect and courtesy</li>
              <li>Not engage in disruptive or dangerous behavior during a Ride</li>
              <li>Not request Drivers to violate traffic laws or regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Service Description</h2>
            <p>
              RideShare provides a platform that connects Drivers and Hitchhikers for shared rides between locations. The Service facilitates ride matching between users within the PES University community. RideShare does not provide transportation services and is not a transportation carrier.
            </p>
            <p className="mt-2">
              The platform supports both two-wheeler (scooter/bike) and four-wheeler (car) rides. Two-wheeler rides are limited to 1 passenger with recommended pricing of ₹3-4 per km, while car rides can accommodate multiple passengers (1-6 seats) with recommended pricing of ₹5-7 per km. All vehicles can set prices between ₹1-10 per km. Hitchhikers must select their preferred vehicle type when searching for rides.
            </p>
            <p className="mt-2">
              <strong>Important:</strong> RideShare does not process, facilitate, or handle any payments. Fare amounts displayed are calculated estimates only. All financial transactions (if any) occur directly between Drivers and Hitchhikers offline. Users are responsible for their own payment arrangements.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Notifications</h2>
            <p>
              By using this application, you consent to receive notifications regarding your ride updates via email. This includes, but is not limited to, confirmations, changes, and cancellations related to your rides.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Cancellation Policy and Reliability Ratings</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">8.1 Cancellation Policy</h3>
            <p>
              Users may cancel rides at any time, but cancellations affect your reliability rating as follows:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Drivers</strong>: Cancelling a ride with accepted Hitchhikers significantly reduces your reliability rating more than cancelling a ride with only pending requests.</li>
              <li><strong>Hitchhikers</strong>: Cancelling an accepted ride request reduces your reliability rating more than cancelling a pending request.</li>
              <li>Successfully completing rides improves your reliability rating.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">8.2 Reliability Rating System</h3>
            <p>
              Your reliability rating is calculated based on your ride behavior:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Completing rides increases your rating</li>
              <li>Cancelling accepted rides decreases your rating significantly</li>
              <li>Cancelling pending/non-accepted rides has minimal impact</li>
              <li>Your rating is visible to other users and affects your trustworthiness on the platform</li>
              <li>Consistently low ratings may result in account restrictions</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Issue Reporting and Dispute Resolution</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">9.1 Reporting Issues</h3>
            <p>Users may report issues related to rides through the Service's reporting system. This includes, but is not limited to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>No-show incidents</li>
              <li>Safety concerns</li>
              <li>Payment disputes</li>
              <li>Other ride-related issues</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">9.2 Reporting Rights and Limitations</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Drivers</strong> may report issues about Hitchhikers for both upcoming and completed rides.</li>
              <li><strong>Hitchhikers</strong> may report issues about Drivers for rides where their participation was accepted, excluding rides cancelled by the Hitchhiker themselves.</li>
              <li>Issues must be reported within a reasonable time after the ride or incident.</li>
              <li>False or malicious reports may result in account suspension or termination.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">9.3 Information Shared During Reporting</h3>
            <p>When reporting issues:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Only first names are displayed to maintain privacy while enabling identification.</li>
              <li>Reported issues are reviewed by administrators and may affect user reliability ratings.</li>
              <li>Users agree that reported information may be shared with relevant parties for resolution purposes.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, RideShare shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of or in connection with your use of the Service.
            </p>
            <p>
              RideShare does not guarantee the quality, safety, suitability, or availability of Drivers or their vehicles. Users acknowledge and accept the risks associated with transportation services.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless RideShare and its officers, directors, employees, and agents from and against all claims, liabilities, damages, losses, costs, expenses, and fees (including reasonable attorneys' fees) arising from or relating to your use of the Service or violation of these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">12. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by RideShare and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from the Service without prior written consent.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">13. Dispute Resolution</h2>
            <p>
              Any disputes arising out of or related to these Terms or the Service shall be resolved through amicable negotiation. If the dispute cannot be resolved through negotiation, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996 of India. The arbitration shall take place in Bangalore, Karnataka, India.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Subject to the dispute resolution provisions, the courts of Bangalore, Karnataka, India shall have exclusive jurisdiction over any disputes arising out of these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">15. Modification of Terms</h2>
            <p>
              RideShare reserves the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the revised Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">16. Termination</h2>
            <p>
              RideShare may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">17. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
              <br />
              <a href="mailto:rideshare.pesu@gmail.com" className="text-blue-600 hover:underline">
                rideshare.pesu@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 