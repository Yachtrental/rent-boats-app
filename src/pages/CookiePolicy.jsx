import React from 'react';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const CookiePolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Cookie Policy</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide a better user experience.
            </p>
            <p>
              Cookies contain information that is transferred to your device's hard drive. They help us recognize your device and remember certain information about your preferences or past actions on our website.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Cookies</h2>
            <p>Rent-Boats uses cookies for several important purposes:</p>
            <ul>
              <li><strong>Essential Operations:</strong> To ensure our website functions properly and securely</li>
              <li><strong>User Authentication:</strong> To keep you signed in and maintain your session</li>
              <li><strong>Preferences:</strong> To remember your settings and personalize your experience</li>
              <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services</li>
              <li><strong>Marketing:</strong> To deliver relevant advertisements and measure their effectiveness</li>
              <li><strong>Security:</strong> To detect fraud and protect against security threats</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Types of Cookies We Use</h2>
            
            <h3>3.1 Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, services you have asked for cannot be provided.
            </p>
            <div className="cookie-table">
              <h4>Examples:</h4>
              <ul>
                <li><strong>Session cookies:</strong> Maintain your session while browsing</li>
                <li><strong>Security cookies:</strong> Authenticate users and prevent fraudulent use</li>
                <li><strong>Load balancing cookies:</strong> Distribute user sessions across our servers</li>
              </ul>
            </div>

            <h3>3.2 Performance and Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance and user experience.
            </p>
            <div className="cookie-table">
              <h4>We use services from:</h4>
              <ul>
                <li><strong>Google Analytics:</strong> Website traffic analysis and user behavior insights</li>
                <li><strong>Hotjar:</strong> User session recordings and heatmaps (anonymized)</li>
                <li><strong>Mixpanel:</strong> Product analytics and user engagement tracking</li>
              </ul>
            </div>

            <h3>3.3 Functionality Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, or location. They may be set by us or by third-party providers whose services we use.
            </p>
            <div className="cookie-table">
              <h4>Examples:</h4>
              <ul>
                <li><strong>Language preferences:</strong> Remember your chosen language</li>
                <li><strong>Search filters:</strong> Remember your boat search preferences</li>
                <li><strong>Location settings:</strong> Remember your preferred search location</li>
                <li><strong>UI preferences:</strong> Remember customization choices</li>
              </ul>
            </div>

            <h3>3.4 Targeting and Advertising Cookies</h3>
            <p>
              These cookies are used to deliver advertisements that are more relevant to you and your interests. They also help measure the effectiveness of advertising campaigns and limit the number of times you see an advertisement.
            </p>
            <div className="cookie-table">
              <h4>We work with partners including:</h4>
              <ul>
                <li><strong>Google Ads:</strong> Targeted advertising and remarketing</li>
                <li><strong>Facebook Pixel:</strong> Social media advertising and audience building</li>
                <li><strong>LinkedIn Insights:</strong> Professional network advertising</li>
                <li><strong>Twitter Ads:</strong> Social media marketing campaigns</li>
              </ul>
            </div>

            <h3>3.5 Social Media Cookies</h3>
            <p>
              These cookies are set by social media services that we've added to the site to enable you to share our content with your friends and networks. They can track your browser across other sites and build a profile of your interests.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Cookie Duration</h2>
            
            <h3>4.1 Session Cookies</h3>
            <p>
              Session cookies are temporary and are deleted when you close your browser. They help maintain your session while you navigate through our website.
            </p>

            <h3>4.2 Persistent Cookies</h3>
            <p>
              Persistent cookies remain on your device for a specified period or until you delete them. They help us recognize you as a returning visitor and remember your preferences.
            </p>
            <div className="cookie-duration-info">
              <h4>Typical durations:</h4>
              <ul>
                <li><strong>Authentication cookies:</strong> 30 days</li>
                <li><strong>Preference cookies:</strong> 1 year</li>
                <li><strong>Analytics cookies:</strong> 2 years</li>
                <li><strong>Marketing cookies:</strong> 30-90 days</li>
              </ul>
            </div>
          </section>

          <section className="legal-section">
            <h2>5. Third-Party Cookies</h2>
            <p>
              Some cookies on our website are placed by third-party services. We don't control these cookies, and you should check the relevant third party's website for more information.
            </p>
            
            <h3>5.1 Third-Party Services We Use</h3>
            <ul>
              <li><strong>Google Services:</strong> Analytics, Ads, Maps, and reCAPTCHA</li>
              <li><strong>Payment Processors:</strong> Stripe, PayPal for secure transactions</li>
              <li><strong>Customer Support:</strong> Intercom, Zendesk for live chat and support</li>
              <li><strong>Social Media:</strong> Facebook, Twitter, Instagram, LinkedIn plugins</li>
              <li><strong>Content Delivery:</strong> CloudFlare, AWS for website performance</li>
              <li><strong>Email Marketing:</strong> Mailchimp, SendGrid for communications</li>
            </ul>

            <h3>5.2 Managing Third-Party Cookies</h3>
            <p>
              You can manage third-party cookies through your browser settings or by visiting the privacy settings of the respective third-party services. Many third parties also provide opt-out mechanisms on their websites.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Cookie Choices</h2>
            
            <h3>6.1 Cookie Consent</h3>
            <p>
              When you first visit our website, we'll ask for your consent to use cookies (except for strictly necessary ones). You can accept all cookies, reject non-essential cookies, or customize your preferences.
            </p>

            <h3>6.2 Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete existing cookies</li>
              <li>Set your browser to notify you when cookies are being sent</li>
            </ul>

            <h4>Browser-Specific Instructions:</h4>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
              <li><a href="https://support.microsoft.com/en-us/help/4027947/microsoft-edge-delete-cookies" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h3>6.3 Opt-Out Tools</h3>
            <p>You can also use industry opt-out tools:</p>
            <ul>
              <li><a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">Digital Advertising Alliance</a></li>
              <li><a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">Your Online Choices (EU)</a></li>
              <li><a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Impact of Disabling Cookies</h2>
            <p>
              While you have the choice to disable cookies, doing so may affect your experience on our website:
            </p>
            <ul>
              <li><strong>Functionality:</strong> Some features may not work properly or may be unavailable</li>
              <li><strong>Personalization:</strong> We won't be able to remember your preferences</li>
              <li><strong>Authentication:</strong> You may need to sign in repeatedly</li>
              <li><strong>Performance:</strong> The website may load slower or behave unexpectedly</li>
              <li><strong>Analytics:</strong> We won't be able to improve our services based on usage data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Mobile App Tracking</h2>
            <p>
              If you use our mobile application, we may use similar technologies to cookies, such as:
            </p>
            <ul>
              <li><strong>Local Storage:</strong> Data stored locally on your device</li>
              <li><strong>SDKs:</strong> Software development kits from third-party services</li>
              <li><strong>Device Identifiers:</strong> Unique identifiers for analytics and advertising</li>
              <li><strong>Push Notifications:</strong> Tokens to deliver personalized notifications</li>
            </ul>
            <p>
              You can control these through your device settings, including opting out of personalized advertising and limiting ad tracking.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. International Data Transfers</h2>
            <p>
              Some of our cookie-related services may involve data transfers to countries outside your location. These transfers are conducted in accordance with applicable data protection laws and include appropriate safeguards.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. When we make changes, we'll update the "Last Updated" date at the top of this policy.
            </p>
            <p>
              For significant changes, we'll provide notice through our website or other appropriate means. Your continued use of our website after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@rent-boats.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@rent-boats.com</p>
              <p><strong>Mailing Address:</strong><br />
                Rent-Boats Privacy Team<br />
                Marina Bay, Suite 300<br />
                Miami, FL 33131, USA</p>
              <p><strong>Phone:</strong> +1 (800) RENT-BOAT</p>
            </div>
          </section>

          <section className="legal-section">
            <h2>12. Related Policies</h2>
            <p>For more information about how we handle your data, please review:</p>
            <ul>
              <li><a href="/privacy-policy">Privacy Policy</a> - Our comprehensive data privacy practices</li>
              <li><a href="/terms-conditions">Terms & Conditions</a> - The legal terms governing our services</li>
              <li><a href="/terms-of-use">Terms of Use</a> - Rules for using our platform</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
