import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const Owners = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>List Your Boat on Rent-Boats</h1>
          <p className="subtitle">Turn Your Boat Into a Profitable Asset</p>
        </div>

        <div className="legal-content">
          <section className="owners-hero">
            <h2>Why List Your Boat With Us?</h2>
            <p>
              Join thousands of successful boat owners who have transformed their vessels into income-generating assets. Rent-Boats provides the most comprehensive platform for yacht charter with unmatched support, security, and earning potential.
            </p>
          </section>

          <section className="legal-section">
            <h2>Earn More, Worry Less</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>💰 Maximize Your Earnings</h3>
                <p>Earn up to $50,000+ annually by renting your boat when you're not using it. Set your own prices and availability.</p>
              </div>
              <div className="feature-item">
                <h3>🛡️ Comprehensive Insurance</h3>
                <p>Every rental includes $2M liability coverage and hull damage protection at no extra cost to you.</p>
              </div>
              <div className="feature-item">
                <h3>✅ Verified Renters</h3>
                <p>All renters undergo thorough background checks and boating credential verification before booking.</p>
              </div>
              <div className="feature-item">
                <h3>💼 Professional Support</h3>
                <p>24/7 customer service team handles inquiries, bookings, and any issues that arise.</p>
              </div>
              <div className="feature-item">
                <h3>💳 Secure Payments</h3>
                <p>Fast, reliable payments deposited directly to your account within 24 hours of rental completion.</p>
              </div>
              <div className="feature-item">
                <h3>📊 Market Insights</h3>
                <p>Access analytics and pricing recommendations to optimize your listing performance.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>How It Works</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <h3>Create Your Listing</h3>
                <p>
                  Upload photos, add boat specifications, and write a compelling description. Our listing optimization tools help you create an attractive profile that gets bookings.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h3>Set Your Terms</h3>
                <p>
                  Define your pricing, availability calendar, rental rules, and location. You maintain complete control over when and how your boat is rented.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h3>Receive Bookings</h3>
                <p>
                  Get instant notifications when renters request your boat. Review their profiles and credentials, then approve or decline at your discretion.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <h3>Meet & Hand Off</h3>
                <p>
                  Conduct a brief orientation with the renter, review safety procedures, and complete the pre-rental inspection checklist via our mobile app.
                </p>
              </div>
              <div className="step-item">
                <div className="step-number">5</div>
                <h3>Get Paid</h3>
                <p>
                  Once the rental is complete and the post-inspection is done, payment is automatically processed and deposited to your account.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>What Makes Rent-Boats Different</h2>
            <div className="comparison-grid">
              <div className="comparison-item">
                <h3>🌟 Premium Marketplace</h3>
                <p>Your boat is showcased to millions of qualified boating enthusiasts actively searching for rental experiences.</p>
              </div>
              <div className="comparison-item">
                <h3>🔒 Advanced Security</h3>
                <p>Multi-layer identity verification, real-time GPS tracking, and geofencing ensure your boat stays safe and secure.</p>
              </div>
              <div className="comparison-item">
                <h3>🛠️ Maintenance Support</h3>
                <p>Access to our network of certified marine technicians for repairs, maintenance, and pre-rental inspections.</p>
              </div>
              <div className="comparison-item">
                <h3>📱 Mobile Management</h3>
                <p>Manage bookings, communicate with renters, and handle inspections all from our intuitive mobile app.</p>
              </div>
              <div className="comparison-item">
                <h3>📊 Dynamic Pricing</h3>
                <p>AI-powered pricing suggestions based on demand, seasonality, and market trends to maximize your revenue.</p>
              </div>
              <div className="comparison-item">
                <h3>🎯 Marketing Tools</h3>
                <p>Professional photography services, SEO optimization, and featured listing opportunities to boost visibility.</p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Eligibility Requirements</h2>
            <p>To list your boat on Rent-Boats, you must meet the following criteria:</p>
            <ul>
              <li><strong>Ownership:</strong> You must be the legal owner or have explicit written authorization to rent the vessel</li>
              <li><strong>Registration:</strong> Boat must be properly registered with appropriate maritime authorities</li>
              <li><strong>Insurance:</strong> Maintain current boat insurance policy (we provide additional coverage)</li>
              <li><strong>Safety:</strong> All required safety equipment must be current and Coast Guard approved</li>
              <li><strong>Condition:</strong> Vessel must be seaworthy and in good working condition</li>
              <li><strong>Documentation:</strong> Provide registration, insurance, and ownership documentation</li>
              <li><strong>Age Requirement:</strong> You must be at least 18 years old</li>
              <li><strong>Bank Account:</strong> Valid bank account for payment deposits</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Transparent Pricing</h2>
            <div className="pricing-info">
              <h3>Service Fees</h3>
              <p>
                Rent-Boats charges a competitive service fee for each booking:
              </p>
              <ul>
                <li><strong>15% Platform Fee:</strong> Covers payment processing, insurance, customer support, and platform maintenance</li>
                <li><strong>No Hidden Costs:</strong> No monthly fees, listing fees, or surprise charges</li>
                <li><strong>You Keep 85%:</strong> Of every rental fee goes directly to you</li>
              </ul>
              
              <h4>Example Earnings</h4>
              <div className="earnings-example">
                <p><strong>Rental Price:</strong> $500/day</p>
                <p><strong>Platform Fee (15%):</strong> -$75</p>
                <p><strong>Your Earnings:</strong> <span className="highlight">$425/day</span></p>
              </div>
              
              <p className="note">
                With just 10 rental days per month at $500/day, you could earn over $50,000 annually!
              </p>
            </div>
          </section>

          <section className="legal-section">
            <h2>Insurance & Protection</h2>
            <h3>Comprehensive Coverage</h3>
            <p>Every Rent-Boats rental includes:</p>
            <ul>
              <li><strong>$2 Million Liability Insurance:</strong> Protects against third-party claims for bodily injury or property damage</li>
              <li><strong>Hull & Machinery Coverage:</strong> Up to vessel value for accidental damage during rentals</li>
              <li><strong>On-Water Towing:</strong> Emergency towing service included</li>
              <li><strong>Legal Support:</strong> Access to maritime legal experts if disputes arise</li>
              <li><strong>Damage Deposit Hold:</strong> Security deposits held from renters before each rental</li>
            </ul>
            
            <h3>Claims Process</h3>
            <p>
              In the rare event of damage or incident, our streamlined claims process ensures quick resolution:
            </p>
            <ol>
              <li>Report incident immediately via app</li>
              <li>Document damage with photos and description</li>
              <li>Our insurance team investigates within 24 hours</li>
              <li>Approved repairs proceed with our partner network</li>
              <li>Compensation processed within 7-10 business days</li>
            </ol>
          </section>

          <section className="legal-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-container">
              <div className="faq-item">
                <h4>How quickly can I start earning?</h4>
                <p>
                  Most owners receive their first booking within 2-3 days of listing activation. Complete profiles with professional photos typically get booked even faster.
                </p>
              </div>
              <div className="faq-item">
                <h4>What if my boat gets damaged?</h4>
                <p>
                  Our comprehensive insurance covers all accidental damage during rentals. You'll be fully compensated for repairs or replacement value if damage occurs.
                </p>
              </div>
              <div className="faq-item">
                <h4>Can I decline rental requests?</h4>
                <p>
                  Absolutely! You maintain complete control over who rents your boat. Review each renter's profile, credentials, and reviews before accepting.
                </p>
              </div>
              <div className="faq-item">
                <h4>Do I need to be present during rentals?</h4>
                <p>
                  No, but you must conduct the pre-rental orientation and inspection. After handoff, renters operate independently within agreed terms.
                </p>
              </div>
              <div className="faq-item">
                <h4>What types of boats can I list?</h4>
                <p>
                  We accept sailboats, motorboats, yachts, catamarans, fishing boats, pontoons, and more. Vessels must be 16 feet or longer and meet safety standards.
                </p>
              </div>
              <div className="faq-item">
                <h4>How do payments work?</h4>
                <p>
                  Payment is held securely during the rental period. After successful completion and post-inspection, funds are deposited to your bank account within 24 hours.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Success Stories</h2>
            <blockquote className="testimonial">
              <p>
                "I was skeptical at first, but Rent-Boats has been incredible. I've earned over $60,000 in the first year, and the insurance coverage gives me complete peace of mind. The platform makes everything so easy!"
              </p>
              <cite>— Michael R., 45ft Yacht Owner, Miami</cite>
            </blockquote>
            
            <blockquote className="testimonial">
              <p>
                "As a weekend boater, my vessel sat unused most of the time. Now it pays for itself and then some. The verification process ensures only qualified renters, and I've never had an issue."
              </p>
              <cite>— Sarah L., Sailboat Owner, San Diego</cite>
            </blockquote>
            
            <blockquote className="testimonial">
              <p>
                "The customer support team is outstanding. They handle all the questions from potential renters, which saves me so much time. I just approve bookings and collect payments!"
              </p>
              <cite>— James T., Fishing Boat Owner, Key West</cite>
            </blockquote>
          </section>

          <section className="legal-section cta-section">
            <h2>Ready to Start Earning?</h2>
            <p>
              Join the Rent-Boats community today and transform your boat into a profitable asset. The process takes just 15 minutes, and you could have your first booking within days.
            </p>
            <div className="cta-buttons">
              <Link to="/signup" className="cta-button primary">List Your Boat Now</Link>
              <Link to="/how-it-works" className="cta-button secondary">Learn More</Link>
            </div>
            <p className="support-text">
              Questions? Our team is here to help 24/7 at <strong>owners@rent-boats.com</strong> or <strong>+1 (800) RENT-BOAT</strong>
            </p>
          </section>

          <section className="legal-section">
            <h2>Important Links for Owners</h2>
            <ul className="links-list">
              <li><Link to="/terms-conditions">Terms & Conditions for Boat Owners</Link></li>
              <li><Link to="/cancellation-policy">Cancellation Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><a href="/owner-guide.pdf" target="_blank">Download Complete Owner's Guide (PDF)</a></li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Owners;
