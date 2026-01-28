import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Last Updated: 23/10/2025
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p>
              RideShare ("we," "our," or "us") values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our RideShare application and services (collectively, the "Service").
            </p>
            <p>
              We adhere to the principles of the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("IT Rules") of India.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Identity Information</strong>: Name, email address, and student identification number (SRN/PRN).</li>
              <li><strong>Contact Information</strong>: Phone number and home address.</li>
              <li><strong>Academic Information</strong>: Program, branch, semester, section, and campus details.</li>
              <li><strong>Profile Information</strong>: Gender and college/campus details.</li>
              <li><strong>Driver-Specific Information</strong>: Vehicle model, vehicle type (scooter/bike or car), seating capacity, and price per kilometer. This information is shared with Hitchhikers when their ride request is accepted.</li>
              <li><strong>Issue Reports</strong>: Information about reported ride issues, including issue type, description, and involved parties.</li>
              <li><strong>Location Information</strong>: Home address, pickup and drop-off locations for ride coordination.</li>
              <li><strong>Ride Information</strong>: Calculated fare amounts (for information only - payments are handled offline between users), ride history, and reliability ratings.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">2.2 Usage Information</h3>
            <p>We also collect information about how you use our Service:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Device Information</strong>: Device type, operating system, browser type, and IP address.</li>
              <li><strong>Log Data</strong>: Access times, pages viewed, and system activity.</li>
              <li><strong>Ride Information</strong>: Ride details, frequency of use, and ride preferences.</li>
              <li><strong>Interaction Information</strong>: How you interact with the Service, including button clicks and navigation patterns.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Authentication and Credential Security</h2>
            <p>
              <strong>We take your credential security seriously.</strong> Here's how we authenticate users while protecting your privacy:
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 PESU Academy Authentication</h3>
            <p>
              RideShare uses PESU Academy's official authentication system to verify your identity. When you log in:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Your password is NEVER stored</strong>: We do not store, log, or have access to your PESU Academy password at any time.</li>
              <li><strong>Direct verification</strong>: Your credentials are sent directly to PESU Academy's authentication server (similar to "Sign in with Google").</li>
              <li><strong>Minimal data access</strong>: We only receive confirmation of successful authentication along with your basic profile information (name, SRN, email, campus, etc.) that PESU Academy provides.</li>
              <li><strong>Encrypted transmission</strong>: All authentication requests are transmitted using industry-standard HTTPS encryption.</li>
              <li><strong>No password logging</strong>: Our servers never log, cache, or store your password in any form - encrypted or otherwise.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.2 What We Receive and Store</h3>
            <p>After successful authentication, we receive the following information from PESU Academy:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Basic Profile</strong>: Name, email, SRN, PRN</li>
              <li><strong>Academic Details</strong>: Program, branch, semester, section</li>
              <li><strong>Campus Information</strong>: Campus name and campus code</li>
              <li><strong>Contact Information</strong>: Phone number (as registered with PESU Academy)</li>
            </ul>
            <p className="mt-2">Additionally, you provide the following information when setting up your ride-sharing profile:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Location</strong>: Home address (for ride coordination)</li>
              <li><strong>Gender</strong>: For safety and matching preferences</li>
              <li><strong>Vehicle Details</strong>: (For drivers) Vehicle model, vehicle type (scooter/bike or car), seating capacity, price per kilometer</li>
            </ul>
            <p className="mt-2">We also maintain:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Ride history and preferences</li>
              <li>Reliability ratings based on your ride behavior</li>
              <li>Session tokens for keeping you logged in (these expire and can be revoked)</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Third-Party Authentication Server</h3>
            <p>
              The PESU Academy authentication is handled by an independent authentication server that interfaces with PESU Academy's systems. This server:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Validates your credentials directly with PESU Academy</li>
              <li>Returns only authentication success/failure status and basic profile data</li>
              <li>Does not retain or log your password</li>
              <li>Is separate from our main application servers for additional security</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. How We Collect Information</h2>
            <p>We collect information through:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Direct Interaction</strong>: Information you provide when registering, creating a profile, scheduling rides, or communicating with other users.</li>
              <li><strong>Automated Technologies</strong>: Cookies, web beacons, and similar technologies that collect information about your device and browsing activities.</li>
              <li><strong>PESU Academy Authentication</strong>: Basic profile information provided by PESU Academy's authentication system upon successful login.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Provide and Improve the Service</strong>: To operate, maintain, and enhance our Service.</li>
              <li><strong>User Authentication</strong>: To verify your identity and maintain account security.</li>
              <li><strong>Ride Management</strong>: To facilitate ride matching, scheduling, and communications between Drivers and Hitchhikers. This includes calculating estimated fares (actual payments are handled offline between users).</li>
              <li><strong>Communication</strong>: To send you ride-related notifications via email (confirmations, cancellations, updates, and issue reports).</li>
              <li><strong>Customer Support</strong>: To provide customer support and respond to inquiries.</li>
              <li><strong>Issue Resolution</strong>: To process and resolve reported issues between users, including investigating complaints and taking appropriate action.</li>
              <li><strong>Safety and Security</strong>: To ensure the safety and security of our users and the Service, including maintaining user reliability ratings based on ride completion and cancellation behavior.</li>
              <li><strong>Legal Compliance</strong>: To comply with applicable laws and regulations.</li>
              <li><strong>Analytics</strong>: To analyze usage patterns and improve our Service.</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">5.1 Payment Processing</h3>
            <p>
              <strong>Important:</strong> RideShare does NOT process, collect, or handle any payments. The fare amounts displayed are calculated estimates for reference only. All financial transactions (if any) occur directly between Drivers and Hitchhikers offline. We do not store payment information, credit card details, or any financial transaction data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Other Users</strong>: When you use our Service, certain information is shared with other users as necessary for the functioning of the Service. Before a ride is accepted, Hitchhikers can see driver's gender, partial SRN (last 3 digits hidden), vehicle type, and reliability rating. For privacy protection, only first names are displayed in certain contexts such as issue reporting.</li>
              <li><strong>Confirmed Rides</strong>: When a Hitchhiker's ride request is accepted, they will see the Driver's first name, phone number, vehicle model, and vehicle type to facilitate the ride. Similarly, Drivers can see accepted Hitchhikers' names and contact information.</li>
              <li><strong>Issue Reports</strong>: When issues are reported, limited information (first names) is shared to maintain privacy while enabling issue resolution. All reports are reviewed by administrators.</li>
              <li><strong>Service Providers</strong>: Third-party vendors who provide services on our behalf, such as data analysis, and customer support.</li>
              <li><strong>Legal Authorities</strong>: When required by law, court order, or governmental regulation.</li>
              <li><strong>Safety and Security</strong>: To protect the rights, property, or safety of RideShare, our users, or others.</li>
              <li><strong>Business Transfers</strong>: In connection with a merger, acquisition, or sale of assets.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">6.1 Privacy in Issue Reporting</h2>
            <p>
              To balance transparency and privacy, we implement the following practices in our issue reporting system:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Only first names are displayed when users report or view issues</li>
              <li>Drivers can report issues about Hitchhikers for both upcoming and completed rides</li>
              <li>Hitchhikers can report issues about Drivers for accepted rides (excluding self-cancelled rides)</li>
              <li>All reported issues are logged and reviewed by administrators</li>
              <li>Issue reports may affect user reliability ratings</li>
              <li>Personal information from issue reports may be shared with involved parties for resolution purposes</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
            <p>
              We maintain security measures consistent with the requirements of the IT Rules, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular security assessments and audits</li>
              <li>Staff training on data protection and security</li>
              <li>Incident response procedures</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The duration of your relationship with RideShare</li>
              <li>Legal obligations to retain data for certain periods</li>
              <li>Pending or potential litigation</li>
              <li>Our legitimate business interests</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Your Rights and Choices</h2>
            <p>
              Under applicable Indian laws, you have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Access and Review</strong>: You have the right to access and review your personal information.</li>
              <li><strong>Correction</strong>: You have the right to correct inaccurate or incomplete personal information.</li>
              <li><strong>Deletion</strong>: You have the right to request deletion of your personal information, subject to legal requirements.</li>
              <li><strong>Restriction</strong>: You have the right to restrict the processing of your personal information under certain circumstances.</li>
              <li><strong>Data Portability</strong>: You have the right to receive your personal information in a structured, commonly used, and machine-readable format.</li>
              <li><strong>Objection</strong>: You have the right to object to the processing of your personal information.</li>
              <li><strong>Withdrawal of Consent</strong>: You have the right to withdraw your consent at any time, where we rely on consent as the legal basis for processing.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the "Contact Information" section.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Children's Privacy</h2>
            <p>
              Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Third-Party Links and Services</h2>
            <p>
              Our Service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policies of these third parties.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">12. Cookies and Similar Technologies</h2>
            <p>
              We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our Service. Cookies are small text files that are stored on your device when you visit a website. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device until deleted).
            </p>
            <p>
              You can control cookies through your browser settings. However, if you disable cookies, some features of our Service may not function properly.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">13. International Data Transfers</h2>
            <p>
              Your personal information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that differ from the laws of your country.
            </p>
            <p>
              By using our Service, you consent to the transfer of your personal information to countries outside of India, including but not limited to the United States, where our servers and service providers are located.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">14. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">15. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
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

export default PrivacyPolicy; 