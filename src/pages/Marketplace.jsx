import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const Marketplace = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Rent-Boats Marketplace</h1>
          <p className="subtitle">Discover, Compare, and Book Yachts and Boats Worldwide</p>
        </div>

        <div className="legal-content">
          <section className="marketplace-intro">
            <h2>Find Your Perfect Boat</h2>
            <p>
              Explore the world's most trusted yacht charter marketplace. From luxury motor yachts and sailing yachts to catamarans and fishing boats, Rent-Boats connects you with verified vessels across the globe.
            </p>
            <div className="cta-buttons">
              <Link to="/search" className="cta-button primary">Start Searching</Link>
              <Link to="/how-it-works" className="cta-button secondary">How It Works</Link>
            </div>
          </section>

          <section className="legal-section">
            <h2>Top Destinations</h2>
            <div className="destinations-grid">
              <div className="destination-card">
                <h3>Mediterranean</h3>
                <p>French Riviera, Amalfi Coast, Balearic Islands, Greek Isles, Croatia</p>
              </div>
              <div className="destination-card">
                <h3>Caribbean</h3>
                <p>Bahamas, British Virgin Islands, St. Barts, Antigua, Turks & Caicos</p>
              </div>
              <div className="destination-card">
                <h3>North America</h3>
                <p>Miami, Fort Lauderdale, Key West, Los Angeles, Seattle</p>
              </div>
              <div className="destination-card">
                <h3>Asia-Pacific</h3>
                <p>Phuket, Bali, Sydney, Auckland, Maldives</p>
              </div>
              <div className="destination-card">
                <h3>Northern Europe</h3>
                <p>Norwegian Fjords, Stockholm Archipelago, Scottish Isles</p>
              </div>
              <div className="destination-card">
                <h3>Middle East</h3>
                <p>Dubai Marina, Abu Dhabi, Red Sea</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Popular Categories</h2>
            <div className="categories-grid">
              <div className="category-card">
                <h3>Luxury Motor Yachts</h3>
                <p>Premium crewed charters with top-tier amenities</p>
              </div>
              <div className="category-card">
                <h3>Sailing Yachts</h3>
                <p>Authentic sailing experiences for adventurers</p>
              </div>
              <div className="category-card">
                <h3>Catamarans</h3>
                <p>Spacious, stable platforms for families and groups</p>
              </div>
              <div className="category-card">
                <h3>Day Boats</h3>
                <p>Speedboats, bowriders, and pontoons for day trips</p>
              </div>
              <div className="category-card">
                <h3>Fishing Boats</h3>
                <p>Sportfishing charters with experienced captains</p>
              </div>
              <div className="category-card">
                <h3>Event Charters</h3>
                <p>Corporate events, birthdays, engagements, and more</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Why Book With Rent-Boats</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>✅ Verified Vessels & Crews</h3>
                <p>All listings are verified. Crewed charters use licensed captains and professional crew.</p>
              </div>
              <div className="feature-item">
                <h3>🔒 Secure Payments</h3>
                <p>Protected transactions, escrow handling, and fraud prevention for peace of mind.</p>
              </div>
              <div className="feature-item">
                <h3>🛡️ Insurance Included</h3>
                <p>Comprehensive coverage for every booking, plus 24/7 on-water support.</p>
              </div>
              <div className="feature-item">
                <h3>⭐ Trusted Reviews</h3>
                <p>Transparent reviews and ratings from verified renters only.</p>
              </div>
              <div className="feature-item">
                <h3>💬 Concierge Support</h3>
                <p>Our charter specialists help plan itineraries and match you with the right yacht.</p>
              </div>
              <div className="feature-item">
                <h3>💸 Best Price Guarantee</h3>
                <p>Competitive rates with no hidden fees. Price match available.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>How to Book</h2>
            <ol className="steps-list">
              <li>Search by destination, dates, guests, and boat type</li>
              <li>Compare verified listings and read reviews</li>
              <li>Send a booking request with your trip details</li>
              <li>Confirm itinerary with owner or charter manager</li>
              <li>Pay securely and receive your digital charter agreement</li>
              <li>Set sail and enjoy your on-water experience</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>Charter Types</h2>
            <ul className="bullet-grid">
              <li>Bareboat charters (qualified skippers)</li>
              <li>Skippered charters</li>
              <li>Crewed luxury charters</li>
              <li>Day rentals and sunset cruises</li>
              <li>Corporate and event charters</li>
              <li>Fishing and watersports packages</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Trusted by Thousands</h2>
            <blockquote className="testimonial">
              “Flawless experience from booking to boarding. The concierge helped plan the perfect itinerary.” — Elena P., Monaco
            </blockquote>
            <blockquote className="testimonial">
              “Best platform for yacht charters. Transparent pricing and amazing support.” — Daniel K., Miami
            </blockquote>
          </section>

          <section className="legal-section cta-section">
            <h2>Ready to Explore?</h2>
            <p>Start your journey today and discover extraordinary boating experiences worldwide.</p>
            <div className="cta-buttons">
              <Link to="/search" className="cta-button primary">Search Boats</Link>
              <Link to="/owners" className="cta-button secondary">List Your Boat</Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
