import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const HowItWorks = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>How Rent-Boats Works</h1>
          <p className="subtitle">Simple, secure, and seamless from search to sail</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>For Renters</h2>
            <ol className="steps-list">
              <li>
                <h3>Create Your Account</h3>
                <p>Sign up in minutes and complete your profile. Verify your identity and any required boating credentials.</p>
              </li>
              <li>
                <h3>Search & Discover</h3>
                <p>Browse verified boats by destination, dates, guests, and boat type. Filter by amenities, price, and features.</p>
              </li>
              <li>
                <h3>Request & Confirm</h3>
                <p>Send booking requests with your trip details. Chat with owners, confirm the itinerary, and review the charter agreement.</p>
              </li>
              <li>
                <h3>Pay Securely</h3>
                <p>Complete your payment with our secure checkout. Your funds are protected and released after a successful charter.</p>
              </li>
              <li>
                <h3>Set Sail</h3>
                <p>Arrive at the marina, complete the pre-boarding checklist, and enjoy your on-water experience with peace of mind.</p>
              </li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>For Owners</h2>
            <ol className="steps-list">
              <li>
                <h3>List Your Boat</h3>
                <p>Create a compelling listing with photos, specs, pricing, and availability. Our tools help optimize for visibility.</p>
              </li>
              <li>
                <h3>Verify & Insure</h3>
                <p>Complete verification and confirm insurance details. Every booking includes additional coverage from Rent-Boats.</p>
              </li>
              <li>
                <h3>Accept Bookings</h3>
                <p>Review renter profiles and accept the requests that fit your schedule and preferences.</p>
              </li>
              <li>
                <h3>Hand Off & Support</h3>
                <p>Meet the renter, conduct the orientation, and complete checklists using our mobile app. Our team is available 24/7.</p>
              </li>
              <li>
                <h3>Get Paid</h3>
                <p>After a successful charter and inspection, funds are transferred directly to your account within 24 hours.</p>
              </li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>Safety & Compliance</h2>
            <ul className="bullet-grid">
              <li>Identity verification and credential checks</li>
              <li>Verified vessel documentation and safety equipment</li>
              <li>Digital pre/post-charter inspections and photo logs</li>
              <li>$2M liability and hull coverage included for bookings</li>
              <li>24/7 on-water support and emergency assistance</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Payments & Protection</h2>
            <ul className="bullet-grid">
              <li>Secure escrow payment handling</li>
              <li>Damage deposit holds collected from renters</li>
              <li>Transparent fees and no hidden charges</li>
              <li>Refunds handled per policy and owner terms</li>
            </ul>
          </section>

          <section className="legal-section cta-section">
            <h2>Ready to Begin?</h2>
            <div className="cta-buttons">
              <Link to="/search" className="cta-button primary">Find Boats</Link>
              <Link to="/owners" className="cta-button secondary">List Your Boat</Link>
            </div>
            <p className="support-text">Questions? We’re here 24/7 at support@rent-boats.com</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
