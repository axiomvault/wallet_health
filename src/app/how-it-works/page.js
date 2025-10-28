'use client';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <>
      {/* We use the <style> tag with jsx to apply page-specific styles */}
      <style jsx>{`
        .timeline-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background-color: var(--bs-primary);
          transform: translateX(-50%);
        }
        @media (max-width: 767.98px) {
          .timeline-line {
            left: 32px; /* Adjusted for alignment */
            transform: none;
          }
          .timeline-item {
            padding-left: 60px; /* Add padding to avoid overlap */
            padding-right: 15px;
          }
          .timeline-item::before {
             left: 20px; /* Position the circle correctly */
          }
          .timeline-image {
            display: none; /* Hide images on mobile for a cleaner look */
          }
        }
        .timeline-item {
            position: relative;
        }
        .timeline-item::before {
            content: '';
            position: absolute;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background-color: #343a40;
            border: 4px solid var(--bs-primary);
            top: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1;
        }
      `}</style>

      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-md-8 offset-md-2 text-center">
            <h1 className="display-4 mb-4">How Our Platform Works</h1>
            <p className="lead">
              Our platform helps verify token transactions, ensures proper approval, and generates secure records to protect both buyers and sellers in a simple, four-step process.
            </p>
          </div>
        </div>

        <div className="row">
            <div className="col-md-10 offset-md-1">
                <div className="position-relative">
                    <div className="timeline-line"></div>
                    
                    {/* Step 1 */}
                    <div className="row timeline-item">
                        <div className="col-md-6 text-md-end">
                            <h3>1. Connect Your Wallet</h3>
                            <p>Choose your preferred network (Ethereum or BNB Chain) and connect your wallet securely through WalletConnect. This allows us to read your public address and token balances.</p>
                        </div>
                        <div className="col-md-6 timeline-image">
                            {/* SVG can be placed here */}
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="row timeline-item">
                         <div className="col-md-6 order-md-2 text-md-start">
                             <h3>2. Blockchain Verification</h3>
                             <p>Our system connects directly to the blockchain to verify your current USDT balance to confirm fund availability.</p>
                         </div>
                         <div className="col-md-6 order-md-1 timeline-image">
                             {/* SVG can be placed here */}
                         </div>
                    </div>
                    
                    {/* Step 3 */}
                    <div className="row timeline-item">
                        <div className="col-md-6 text-md-end">
                            <h3>3. Grant Approval</h3>
                            <p>You grant permission for our verified admin address to interact with your tokens by signing an `approve` transaction. This is a standard, secure process that gives you full control.</p>
                        </div>
                         <div className="col-md-6 timeline-image">
                             {/* SVG can be placed here */}
                         </div>
                    </div>
                    
                    {/* Step 4 */}
                    <div className="row timeline-item">
                         <div className="col-md-6 order-md-2 text-md-start">
                             <h3>4. Secure Transfer Ready</h3>
                             <p>Once approved, your wallet is marked as verified. The System can then initiate the checking of the specified tokens of your wallet, completing the verification process securely.</p>
                         </div>
                         <div className="col-md-6 order-md-1 timeline-image">
                             {/* SVG can be placed here */}
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-8 offset-md-2 text-center">
            <div className="p-5 rounded bg-primary bg-opacity-10">
              <h2>Ready to try our verification system?</h2>
              <p className="lead">Start securing your cryptocurrency transactions today.</p>
              <div className="mt-4">
                <Link href="/" className="btn btn-primary btn-lg">
                  <i className="fas fa-shield-alt me-2"></i>Verify Your Wallet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}