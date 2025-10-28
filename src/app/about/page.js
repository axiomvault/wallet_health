// File: app/about/page.js
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-md-8 offset-md-2 text-center">
          <h1 className="display-4 mb-4">About Our Platform</h1>
          <p className="lead">
            We are a specialized security agency dedicated to providing protection services for cryptocurrency traders and exchanges across multiple blockchains.
          </p>
        </div>
      </div>

      <div className="row mb-5 align-items-center">
        <div className="col-md-6">
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a safer trading environment by providing verification tools that help prevent fraud, ensure proper transaction approvals, and generate secure records of legitimate trades.
          </p>
          <p>
            We focus on solving one of the most common problems in crypto trading: ensuring that sellers actually send the promised tokens after receiving payment.
          </p>
        </div>
        <div className="col-md-6">
          <div className="card bg-dark border-0">
            <div className="card-body text-center">
                {/* SVG Image */}
                <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M175,10 L260,50 L260,110 C260,150 225,180 175,190 C125,180 90,150 90,110 L90,50 Z" fill="none" stroke="#0d6efd" strokeWidth="4"/>
                    <rect x="145" y="80" width="60" height="60" rx="5" fill="#0d6efd"/>
                    <path d="M160,80 L160,60 C160,45 190,45 190,60 L190,80" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round"/>
                    <circle cx="175" cy="100" r="8" fill="#212529"/>
                    <rect x="173" y="100" width="4" height="20" rx="2" fill="#212529"/>
                    <text x="175" y="160" textAnchor="middle" fill="#20c997" fontFamily="Arial" fontWeight="bold" fontSize="18">USDT</text>
                    <path d="M150,170 L165,185 L195,155" fill="none" stroke="#198754" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-12">
          <h2 className="text-center mb-4">Our Core Values</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 bg-dark border-0 text-center">
                <div className="card-body">
                  <i className="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                  <h4>Security</h4>
                  <p>We prioritize the security of both buyers and sellers in every transaction.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 bg-dark border-0 text-center">
                <div className="card-body">
                  <i className="fas fa-sync-alt fa-3x text-info mb-3"></i>
                  <h4>Transparency</h4>
                  <p>We provide clear verification processes and detailed transaction information.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 bg-dark border-0 text-center">
                <div className="card-body">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <h4>Trust</h4>
                  <p>We build trust through reliable verification and secure certificate generation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8 offset-md-2 text-center">
          <div className="p-5 rounded bg-primary bg-opacity-10">
            <h2>Ready to secure your assets?</h2>
            <p className="lead">
              Our team is ready to help you secure your cryptocurrency transactions and trades.
            </p>
            <Link href="/" className="btn btn-primary btn-lg mt-3">
              <i className="fas fa-shield-alt me-2"></i>Try Our Verification System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}