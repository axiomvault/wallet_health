// File: app/layout.js
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Wallet Health Security Protocol',
  description: 'A Multi-Chain Platform to Enable Smart Contracts and Secure Tokens',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        <link rel="stylesheet" href="https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <link rel="icon" href="https://bnbsmartchain.com/wp-content/uploads/2020/06/favicon.png" type="image/x-icon" />
      </head>
      <body>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            {/* Logo on the left */}
            <Link className="navbar-brand" href="/">
              <i className="fas fa-shield-alt me-2"></i>Wallet Health Security Protocol
            </Link>
            
            {/* Mobile Menu Toggler */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            
            {/* Navbar links on the right */}
            <div className="collapse navbar-collapse" id="navbarNav">
              {/* THIS 'ms-auto' CLASS MOVES THE LINKS TO THE RIGHT */}
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <Link className="nav-link" href="/">Home</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/about">About Us</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/how-it-works">How It Works</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main>{children}</main>

        <footer className="py-4 bg-dark text-center text-white mt-auto">
          <div className="container">
            <p className="mb-0">&copy; 2025 Wallet Health Security Protocol. All Rights Reserved.</p>
          </div>
        </footer>

        {/* Bootstrap JS must be included for the mobile menu to work */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  );
}