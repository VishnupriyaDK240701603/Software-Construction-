import { Hexagon } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Hexagon size={20} style={{ color: 'var(--primary)' }} />
          <span>PriceHive</span>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
        <span className="footer-copy">© 2024 PriceHive. All rights reserved.</span>
      </div>
    </footer>
  );
}
