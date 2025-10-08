import React from 'react';
import Footer from '../components/Footer/Footer';
import './LegalPages.css';

const CancellationPolicy = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Cancellation Policy</h1>
          <p className="subtitle">Last Updated: October 2025</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>Overview</h2>
            <p>
              To provide fairness and clarity to both Renters and Owners, Rent-Boats offers standardized cancellation policies. Each listing clearly indicates the policy selected by the Owner, which applies once a booking is confirmed.
            </p>
          </section>

          <section className="legal-section">
            <h2>Policy Options</h2>
            <div className="policy-grid">
              <div className="policy-card">
                <h3>Flexible</h3>
                <ul>
                  <li>100% refund for cancellations made 72+ hours before departure</li>
                  <li>50% refund for cancellations made 24–72 hours before departure</li>
                  <li>No refund within 24 hours of departure</li>
                </ul>
              </div>
              <div className="policy-card">
                <h3>Moderate</h3>
                <ul>
                  <li>100% refund for cancellations made 7+ days before departure</li>
                  <li>50% refund for cancellations made 72 hours–7 days before departure</li>
                  <li>No refund within 72 hours of departure</li>
                </ul>
              </div>
              <div className="policy-card">
                <h3>Strict</h3>
                <ul>
                  <li>75% refund for cancellations made 14+ days before departure</li>
                  <li>25% refund for cancellations made 7–14 days before departure</li>
                  <li>No refund within 7 days of departure</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Weather and Safety Exceptions</h2>
            <p>
              If severe weather or unsafe conditions are forecast by recognized authorities (e.g., Coast Guard advisories), bookings may be rescheduled without penalty or canceled with a full refund at the Owner’s discretion.
            </p>
          </section>

          <section className="legal-section">
            <h2>Owner Cancellations</h2>
            <p>
              If an Owner cancels, Renters receive a full refund and priority rebooking assistance. Repeated owner cancellations may affect listing visibility and account standing.
            </p>
          </section>

          <section className="legal-section">
            <h2>No-Shows and Late Arrivals</h2>
            <ul>
              <li>No-shows are treated as late cancellations under the applicable policy</li>
              <li>Arrivals 60+ minutes late without notice may be treated as no-show</li>
              <li>Partial-day refunds are not provided for late arrivals</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Documentation Requirements</h2>
            <p>
              To process cancellations and potential refunds, communication must occur through the Rent-Boats platform messaging and be submitted prior to the departure time.
            </p>
          </section>

          <section className="legal-section">
            <h2>How to Cancel</h2>
            <ol className="steps-list">
              <li>Go to My Trips and select the booking</li>
              <li>Click Cancel and choose the reason</li>
              <li>Review refund details based on the listing policy</li>
              <li>Confirm cancellation</li>
            </ol>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CancellationPolicy;
