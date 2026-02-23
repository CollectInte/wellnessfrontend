import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* COLUMN 1 */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="#office">Solutions</Link></li>
            <li><Link to="#">Features</Link></li>
            <li><Link to="#">About Us</Link></li>
            <li><Link to="#">Blog</Link></li>
            <li><Link to="#">Support & Help</Link></li>
          </ul>
        </div>

        {/* COLUMN 2 */}
        <div className="footer-col">
          <h4>Useful links</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
            <li><Link to="/demo">Free Demo</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>


        {/* COLUMN 3 */}
        <div className="footer-col">
          <h4>Get in touch</h4>
          <p className="label">Sales</p>
          <p className="contact">📞 +91 90245 70899</p>

          <p className="label">Email</p>
          <p className="contact">✉️ contact@practive.in</p>
        </div>
      </div>


      {/* COLUMN 4 */}
        <div className="footer-col">
          {/* <h4>Policies</h4>
          <ul>
            <li><Link to="#">Terms of Use</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Refund & Cancellation Policy</Link></li>
          </ul> */}
          
        </div>

      {/* BOTTOM SECTION */}
      <div className="footer-bottom">
        <div className="footer-left">
          {/* <img
            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
            alt="Google Play"
            className="playstore"
          /> */}

          <div className="socials">
            <span>🌐</span>
            <span>📸</span>
            <span>💼</span>
            <span>🐦</span>
            <span>▶️</span>
          </div>

          <p className="footer-desc">
            Consultdesk360 is an office management software for Chartered accountants
            and accounting firms that provides tasks, employee and client
            management.
          </p>
        </div>

        {/* <div className="footer-right">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo.svg"
            alt="Meta Partner"
            className="meta-badge"
          />
          <p className="meta-text">Business Partner</p>
        </div> */}
      </div>

      <div className="footer-copy">
        © 2025 Ridgeveda Solutions Private Limited. All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
