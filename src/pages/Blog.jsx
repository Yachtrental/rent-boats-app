import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const Blog = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Rent-Boats Blog</h1>
          <p className="subtitle">Insights, guides, and inspiration for life on the water</p>
        </div>

        <div className="legal-content">
          <section className="blog-intro">
            <h2>Explore Our Latest Articles</h2>
            <p>
              From destination guides and charter tips to maintenance advice and owner success stories, our editorial team curates practical, inspiring content for renters and owners alike.
            </p>
          </section>

          <section className="legal-section">
            <h2>Featured Topics</h2>
            <div className="categories-grid">
              <div className="category-card">
                <h3>Destination Guides</h3>
                <p>Plan unforgettable itineraries across the world’s best boating regions.</p>
              </div>
              <div className="category-card">
                <h3>Charter Tips</h3>
                <p>Expert advice to make your first (or next) charter smooth and safe.</p>
              </div>
              <div className="category-card">
                <h3>Owner Playbook</h3>
                <p>Revenue strategies, pricing insights, and listing optimization for owners.</p>
              </div>
              <div className="category-card">
                <h3>Safety & Compliance</h3>
                <p>Best practices for safe boating and regulatory compliance.</p>
              </div>
              <div className="category-card">
                <h3>Gear & Tech</h3>
                <p>Latest marine tech, electronics, and gear reviews.</p>
              </div>
              <div className="category-card">
                <h3>Stories</h3>
                <p>Real experiences from our community around the globe.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Popular Reads</h2>
            <ul className="links-list">
              <li><Link to="/blog/med-itinerary-7-days">7-Day Mediterranean Yacht Itinerary</Link></li>
              <li><Link to="/blog/bareboat-checklist">Bareboat Charter Checklist</Link></li>
              <li><Link to="/blog/owners-pricing-strategy">Pricing Strategy for Boat Owners</Link></li>
              <li><Link to="/blog/safety-briefing-template">Safety Briefing Template for Charters</Link></li>
              <li><Link to="/blog/eco-boating-practices">Eco-friendly Boating Practices</Link></li>
            </ul>
          </section>

          <section className="legal-section cta-section">
            <h2>Subscribe for Updates</h2>
            <p>Get monthly inspiration, exclusive offers, and expert tips in your inbox.</p>
            <div className="cta-buttons">
              <Link to="/subscribe" className="cta-button primary">Subscribe</Link>
              <Link to="/owners" className="cta-button secondary">For Owners</Link>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
