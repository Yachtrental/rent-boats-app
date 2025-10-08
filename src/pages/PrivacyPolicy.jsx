import React from 'react';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              At Rent-Boats ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our yacht charter marketplace platform.
            </p>
            <p>
              By accessing or using Rent-Boats, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Register for an account</li>
              <li>List a boat on our platform</li>
              <li>Make or accept a booking</li>
              <li>Complete your profile</li>
              <li>Contact customer support</li>
              <li>Subscribe to our newsletter</li>
              <li>Participate in surveys or promotions</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Full name and contact details (email, phone number, mailing address)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Identity verification documents (driver's license, passport)</li>
              <li>Boating license and certification information</li>
              <li>Profile photos and biographical information</li>
              <li>Communication preferences</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you access our platform, we automatically collect certain information, including:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and analytics data</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from third-party sources, such as:</p>
            <ul>
              <li>Social media platforms (if you connect your account)</li>
              <li>Payment processors</li>
              <li>Identity verification services</li>
              <li>Background check providers</li>
              <li>Marketing partners and affiliates</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Service Provision:</strong> To facilitate yacht rentals, process bookings, and enable communication between boat owners and renters</li>
              <li><strong>Account Management:</strong> To create and maintain your account, verify your identity, and provide customer support</li>
              <li><strong>Payment Processing:</strong> To process transactions, prevent fraud, and manage billing</li>
              <li><strong>Safety & Security:</strong> To verify credentials, conduct background checks, ensure platform security, and prevent prohibited activities</li>
              <li><strong>Communication:</strong> To send booking confirmations, updates, important notices, and respond to your inquiries</li>
              <li><strong>Personalization:</strong> To customize your experience and provide relevant recommendations</li>
              <li><strong>Marketing:</strong> To send promotional materials, newsletters, and special offers (you can opt-out anytime)</li>
              <li><strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features</li>
              <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our terms, and protect rights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            
            <h3>4.1 Other Users</h3>
            <p>When you make or accept a booking, we share relevant information with the other party (name, contact details, booking specifics) to facilitate the transaction.</p>

            <h3>4.2 Service Providers</h3>
            <p>We engage third-party companies to perform services on our behalf, including:</p>
            <ul>
              <li>Payment processing</li>
              <li>Identity verification</li>
              <li>Customer support</li>
              <li>Marketing and analytics</li>
              <li>Cloud hosting and storage</li>
            </ul>

            <h3>4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>

            <h3>4.4 Legal Requirements</h3>
            <p>We may disclose your information when required by law or to:</p>
            <ul>
              <li>Comply with legal processes or government requests</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect rights, property, or safety of Rent-Boats, users, or others</li>
              <li>Investigate fraud or security issues</li>
            </ul>

            <h3>4.5 With Your Consent</h3>
            <p>We may share your information for any other purpose with your explicit consent.</p>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest (SSL/TLS protocols)</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection</li>
              <li>Firewall protection and intrusion detection systems</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Restriction:</strong> Request limitation on how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured, commonly used format</li>
              <li><strong>Objection:</strong> Object to processing of your data for certain purposes</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent at any time</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p>To exercise these rights, please contact us at privacy@rent-boats.com</p>
          </section>

          <section className="legal-section">
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services and develop new features</li>
              <li>Deliver personalized content and advertisements</li>
            </ul>
            <p>
              You can control cookie preferences through your browser settings. However, disabling cookies may affect the functionality of our platform. For more information, please see our <a href="/cookie-policy">Cookie Policy</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Children's Privacy</h2>
            <p>
              Rent-Boats is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from your jurisdiction. By using our services, you consent to the transfer of your information to our facilities and third-party service providers wherever located.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Contact Us</h2>
            <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@rent-boats.com</p>
              <p><strong>Mailing Address:</strong><br />
                Rent-Boats Privacy Team<br />
                Marina Bay, Suite 300<br />
                Miami, FL 33131, USA</p>
              <p><strong>Phone:</strong> +1 (800) RENT-BOAT</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>14. Regional Specific Information</h2>
            
            <h3>For European Union Users (GDPR)</h3>
            <p>
              If you are located in the EU/EEA, you have additional rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with your local data protection authority.
            </p>

            <h3>For California Residents (CCPA)</h3>
            <p>
              California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information. We do not sell personal information.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
