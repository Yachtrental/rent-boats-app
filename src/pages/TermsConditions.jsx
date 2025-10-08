import React from 'react';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const TermsConditions = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Terms & Conditions</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions ("Terms") govern your use of the Rent-Boats platform operated by Rent-Boats Inc. ("we," "our," or "us"). By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p>
              If you disagree with any part of these terms, then you may not access the service. These Terms apply to all visitors, users, and others who access or use the service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Rent-Boats is an online marketplace that connects boat owners ("Owners") with individuals seeking to rent boats ("Renters"). We provide the platform and tools to facilitate these transactions but are not a party to the rental agreements between Owners and Renters.
            </p>
            <p>Our services include:</p>
            <ul>
              <li>Online marketplace for boat rentals</li>
              <li>Secure payment processing</li>
              <li>Communication tools between parties</li>
              <li>Customer support services</li>
              <li>Insurance coordination services</li>
              <li>Verification and safety features</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            
            <h3>3.1 Account Creation</h3>
            <p>To use certain features of our service, you must register for an account. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3>3.2 Account Verification</h3>
            <p>
              We may require identity verification, including government-issued ID, boating licenses, and other documentation. Verified accounts receive priority in search results and enhanced features.
            </p>

            <h3>3.3 Account Suspension</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, harmful, or illegal activities.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Boat Owner Terms</h2>
            
            <h3>4.1 Listing Requirements</h3>
            <p>As a Boat Owner, you represent and warrant that:</p>
            <ul>
              <li>You own the boat or have explicit permission to rent it</li>
              <li>The boat is properly registered and licensed</li>
              <li>All safety equipment is current and compliant</li>
              <li>You maintain appropriate insurance coverage</li>
              <li>Your listing information is accurate and complete</li>
              <li>The boat meets all applicable safety standards</li>
            </ul>

            <h3>4.2 Responsibilities</h3>
            <p>Boat Owners are responsible for:</p>
            <ul>
              <li>Maintaining the boat in safe, working condition</li>
              <li>Providing accurate availability calendars</li>
              <li>Responding promptly to rental requests</li>
              <li>Conducting pre and post-rental inspections</li>
              <li>Reporting damages or incidents immediately</li>
              <li>Complying with local maritime regulations</li>
            </ul>

            <h3>4.3 Prohibited Activities</h3>
            <p>Boat Owners may not:</p>
            <ul>
              <li>List boats they don't own or lack authority to rent</li>
              <li>Provide false or misleading information</li>
              <li>Rent unseaworthy or unsafe vessels</li>
              <li>Discriminate against Renters based on protected characteristics</li>
              <li>Attempt to circumvent our platform for payments</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Renter Terms</h2>
            
            <h3>5.1 Booking Requirements</h3>
            <p>As a Renter, you must:</p>
            <ul>
              <li>Be at least 18 years old (or age of majority in your jurisdiction)</li>
              <li>Possess valid boating credentials where required</li>
              <li>Provide accurate personal and payment information</li>
              <li>Review and agree to specific boat terms before booking</li>
              <li>Comply with all applicable maritime laws and regulations</li>
            </ul>

            <h3>5.2 Use of Boats</h3>
            <p>Renters agree to:</p>
            <ul>
              <li>Use boats only for their intended recreational purpose</li>
              <li>Operate boats safely and responsibly</li>
              <li>Follow all instructions provided by the Owner</li>
              <li>Report any damages or incidents immediately</li>
              <li>Return boats in the same condition as received</li>
              <li>Not exceed passenger or weight limits</li>
              <li>Not use boats under the influence of alcohol or drugs</li>
            </ul>

            <h3>5.3 Prohibited Uses</h3>
            <p>Renters may not:</p>
            <ul>
              <li>Use boats for commercial purposes without permission</li>
              <li>Allow unauthorized persons to operate the boat</li>
              <li>Modify or alter the boat in any way</li>
              <li>Use boats for illegal activities</li>
              <li>Exceed agreed-upon geographical boundaries</li>
              <li>Smoke or allow smoking on non-smoking vessels</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Payments and Fees</h2>
            
            <h3>6.1 Service Fees</h3>
            <p>
              Rent-Boats charges service fees to facilitate transactions. These fees are clearly disclosed before booking completion and are non-refundable except as specified in our Refund Policy.
            </p>

            <h3>6.2 Payment Processing</h3>
            <p>
              All payments are processed securely through our approved payment partners. We do not store your complete payment information on our servers.
            </p>

            <h3>6.3 Taxes</h3>
            <p>
              You are responsible for determining and paying any applicable taxes. In some jurisdictions, we may be required to collect and remit taxes on your behalf.
            </p>

            <h3>6.4 Currency</h3>
            <p>
              All prices are displayed in the currency of the boat's location unless otherwise specified. Currency conversion rates are determined by our payment processors.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Cancellations and Refunds</h2>
            <p>
              Cancellation policies vary by boat and are set by individual Owners. Refund eligibility depends on the specific cancellation policy applicable to your booking. Please review our detailed <a href="/cancellation-policy">Cancellation Policy</a> and <a href="/refund-policy">Refund Policy</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Insurance and Liability</h2>
            
            <h3>8.1 Insurance Coverage</h3>
            <p>
              Rent-Boats provides liability insurance coverage for verified bookings subject to policy terms and conditions. This coverage supplements, but does not replace, any insurance carried by Owners or Renters.
            </p>

            <h3>8.2 Limitation of Liability</h3>
            <p>
              Rent-Boats acts as a platform facilitating connections between Owners and Renters. We are not responsible for the condition, safety, or operation of boats listed on our platform. Users assume all risks associated with boat rentals.
            </p>

            <h3>8.3 Damage Claims</h3>
            <p>
              In case of boat damage, our insurance partners will investigate and determine coverage. Users must report incidents immediately and cooperate fully with the claims process.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Prohibited Conduct</h2>
            <p>Users may not:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe upon others' intellectual property rights</li>
              <li>Transmit harmful or malicious code</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Create false or misleading accounts or listings</li>
              <li>Attempt to circumvent our security measures</li>
              <li>Use our platform for unauthorized commercial purposes</li>
              <li>Collect other users' personal information</li>
              <li>Post offensive, discriminatory, or inappropriate content</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>10. Intellectual Property</h2>
            <p>
              The Rent-Boats platform, including its content, features, and functionality, is owned by Rent-Boats Inc. and protected by intellectual property laws. Users may not copy, modify, distribute, or create derivative works without our express written permission.
            </p>
            <p>
              By posting content on our platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content in connection with our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these Terms by reference.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the service after changes constitutes acceptance of the new Terms.
            </p>
            <p>
              We will notify users of material changes via email or platform notification when possible.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. You may also terminate your account at any time by contacting us.
            </p>
            <p>
              Upon termination, your right to use the service ceases immediately, but these Terms remain in effect regarding any prior use of the service.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Dispute Resolution</h2>
            
            <h3>14.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of the State of Florida, United States, without regard to conflict of law principles.
            </p>

            <h3>14.2 Arbitration</h3>
            <p>
              Any disputes arising from these Terms or your use of our services will be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h3>14.3 Class Action Waiver</h3>
            <p>
              You agree not to participate in any class action lawsuits against Rent-Boats. All disputes must be resolved individually.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Miscellaneous</h2>
            
            <h3>15.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any other agreements referenced herein, constitute the entire agreement between you and Rent-Boats.
            </p>

            <h3>15.2 Severability</h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3>15.3 Waiver</h3>
            <p>
              No waiver of any term of these Terms will be deemed a further or continuing waiver of such term or any other term.
            </p>

            <h3>15.4 Assignment</h3>
            <p>
              You may not assign your rights or obligations under these Terms without our written consent. We may assign our rights and obligations without restriction.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Contact Information</h2>
            <p>For questions about these Terms, please contact us:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> legal@rent-boats.com</p>
              <p><strong>Mailing Address:</strong><br />
                Rent-Boats Legal Department<br />
                Marina Bay, Suite 300<br />
                Miami, FL 33131, USA</p>
              <p><strong>Phone:</strong> +1 (800) RENT-BOAT</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;
