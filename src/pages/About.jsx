import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const About = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>About Rent-Boats</h1>
          <p className="subtitle">Your Trusted Partner in Yacht Charter Excellence</p>
        </div>

        <div className="legal-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              Founded with a passion for maritime excellence, Rent-Boats has revolutionized the yacht charter industry by connecting boat owners with adventure seekers worldwide. Since our inception, we've facilitated thousands of unforgettable nautical experiences across premier destinations.
            </p>
            <p>
              What started as a vision to democratize luxury yacht access has grown into a global marketplace where dreams set sail. We believe that everyone deserves the freedom to explore the open waters in style and comfort.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At Rent-Boats, our mission is simple yet profound: to make yacht charter accessible, transparent, and extraordinary. We strive to:
            </p>
            <ul>
              <li>Connect verified boat owners with qualified renters through a secure platform</li>
              <li>Provide comprehensive insurance coverage and support throughout every journey</li>
              <li>Maintain the highest standards of vessel quality and safety</li>
              <li>Deliver exceptional customer service that exceeds expectations</li>
              <li>Foster a community of maritime enthusiasts and responsible boaters</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Why Choose Rent-Boats</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🛡️ Verified Fleet</h3>
                <p>Every vessel undergoes rigorous inspection and certification to ensure your safety and comfort.</p>
              </div>
              <div className="feature-item">
                <h3>💼 Comprehensive Insurance</h3>
                <p>All bookings include full coverage protection for complete peace of mind on the water.</p>
              </div>
              <div className="feature-item">
                <h3>🌍 Global Network</h3>
                <p>Access premium yachts and boats in over 100 destinations across 6 continents.</p>
              </div>
              <div className="feature-item">
                <h3>⚓ Expert Support</h3>
                <p>24/7 multilingual customer service team ready to assist you at every stage.</p>
              </div>
              <div className="feature-item">
                <h3>💎 Best Price Guarantee</h3>
                <p>Transparent pricing with no hidden fees and competitive rates for premium experiences.</p>
              </div>
              <div className="feature-item">
                <h3>⭐ Trusted Reviews</h3>
                <p>Real feedback from verified renters helps you make informed decisions.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Commitment to Excellence</h2>
            <p>
              Excellence isn't just a goal—it's our standard. We continuously invest in technology, safety protocols, and customer experience improvements to ensure Rent-Boats remains the industry leader in yacht charter services.
            </p>
            <p>
              Our dedicated team works tirelessly to verify every listing, support every booking, and resolve any concerns promptly. We're not just a platform; we're your partners in creating extraordinary maritime memories.
            </p>
          </section>

          <section className="about-section">
            <h2>Sustainability & Responsibility</h2>
            <p>
              We recognize our responsibility to protect the marine environments we cherish. Rent-Boats is committed to promoting sustainable boating practices and environmental stewardship through:
            </p>
            <ul>
              <li>Partnering with eco-conscious boat owners who maintain environmentally friendly vessels</li>
              <li>Educating our community on responsible boating and marine conservation</li>
              <li>Supporting marine protection initiatives and coastal cleanup programs</li>
              <li>Encouraging the use of green technologies and sustainable boating practices</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Join Our Community</h2>
            <p>
              Whether you're a boat owner looking to share your vessel or an adventurer seeking your next maritime journey, Rent-Boats welcomes you to our growing global community.
            </p>
            <p>
              <Link to="/marketplace" className="cta-link">Explore our marketplace</Link> or <Link to="/owners" className="cta-link">list your boat</Link> today and discover why thousands trust Rent-Boats for their yacht charter needs.
            </p>
          </section>

          <section className="about-section">
            <h2>Contact Us</h2>
            <p>
              Have questions? We'd love to hear from you. Our team is available 24/7 to assist with any inquiries.
            </p>
            <div className="contact-info">
              <p><strong>Email:</strong> support@rent-boats.com</p>
              <p><strong>Phone:</strong> +1 (800) RENT-BOAT</p>
              <p><strong>Address:</strong> Marina Bay, Suite 300, Miami, FL 33131, USA</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
