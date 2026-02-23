import React from "react";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import logo from '../images/RV_white.png';
import Footer from "./Footer";
import './Testimonials.css';
import "./Hero.css";
import "./WorkSection.css";
import heroImage from "../images/hero.png";
import rvlogo from '../images/RV_logo_transparent.png';
import "./CTASection.css";
import "./Pricing.css";
import './Footer.css';
import "./Landingpage.css";
import document from '../images/Documents.png';
import servicereq from '../images/servicerequest.png';
import bill from '../images/Bills.png';
import { Link } from "react-router-dom";

const Landingpage = () => {

    const testimonials = [
        {
            text: "Practive CA Management Software is a game-changer! Its seamless automation, accuracy, and user-friendly interface make financial management effortless. Highly recommended for efficiency-driven CA professionals.",
            name: "Nawlesh Pandey",
            company: "Bizlaw India Services Private Limited",
            img: "https://i.pravatar.cc/100?img=12",
        },
        {
            text: "Practive has streamlined our entire workflow. Client management, billing, and compliance tracking are now faster and error-free.",
            name: "Rohit Sharma",
            company: "Sharma & Co.",
            img: "https://i.pravatar.cc/100?img=32",
        },
        {
            text: "An excellent platform for modern CA practices. It saves time, improves accuracy, and enhances client satisfaction.",
            name: "Ankit Verma",
            company: "AV Consultants",
            img: "https://i.pravatar.cc/100?img=45",
        },
    ];

    const featuresLeft = [
        { label: "Any Device", icon: "📱" },
        { label: "Live Tracking", icon: "📡" },
        { label: "TeamWork", icon: "👥" },
        { label: "Stay Organized", icon: "⚙️" },
    ];

    return (
        <>
           
            <div className="container-fluid" style={{ fontFamily: "" }}>
                <div className="row" style={{ fontFamily: "" }}>
                    <nav className="navbar navbar-expand-lg bg-white">
                        <div className="container-fluid">

                            {/* BRAND */}
                            <a className="navbar-brand" href="#">
                                <img src={logo} className="img-fluid" style={{ width: "70px", height: "70px" }} />
                            </a>

                            {/* TOGGLER */}
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarSupportedContent"
                                aria-controls="navbarSupportedContent"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>

                            {/* COLLAPSE */}
                            <div className="collapse navbar-collapse" id="navbarSupportedContent">

                                <ul className="navbar-nav mx-auto text-secondary nav-center">
                                    <li className="nav-item">
                                        <a className="nav-link" href="#solutions">Features</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#pricing">Pricing</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#office">Solutions</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#testimonials">Testimonials</a>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to='/contact'>Contact Us</Link>
                                    </li>
                                </ul>

                                {/* ACTION BUTTONS */}
                                <div className="navbar-actions">
                                    <Link to='/login'><button className="btn" style={{ color: "#0065e2ff", fontWeight: "bold", padding: "17px", fontSize: "13px", border: "1px solid #0065e2" }}>Login</button></Link>
                                    <Link to='/contact'><button className="btn btn-primary ms-2">
                                        Get Started
                                    </button></Link>
                                </div>

                            </div>
                        </div>
                    </nav>
                </div>
                <div
                    className="row align-items-center hero-section"
                    style={{ backgroundColor: "#ebf0f6ff" }}
                >
                    {/* LEFT CONTENT */}
                    <div className="col-12 col-md-6 p-4 p-md-5 text-center text-md-start">
                        <h4 className="hero-title">
                            Best Solution For
                            <br />
                            CA, CS & Tax Consultants
                        </h4>

                        <p className="hero-text">
                            Consultdesk360 provides a value-driven solution to manage your accounting
                            firm, employees, and clients.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/demo">
                                <button
                                    className="btn me-md-2 mb-md-0"
                                    style={{
                                        backgroundColor: "#0065e2",
                                        color: "white",
                                        fontWeight: "bold",
                                        padding: "15px 22px",
                                        fontSize: "13px",
                                    }}
                                >
                                    Book a Demo
                                </button>
                            </Link>

                            <Link to="/login">
                                <button
                                    className="btn ms-2 ms-md-0"
                                    style={{
                                        color: "#0065e2",
                                        fontWeight: "bold",
                                        padding: "15px 22px",
                                        fontSize: "13px",
                                        border: "1px solid #0065e2",
                                    }}
                                >
                                    Login
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT IMAGE */}
                    <div className="col-12 col-md-6 p-3 p-md-4 text-center">
                        <img
                            src="https://media.istockphoto.com/id/2194397231/photo/focused-professional-financial-it-specialist-latin-hispanic-business-lady-working.jpg?s=612x612&w=0&k=20&c=IK3fcON053uliiFIpOFibFpSBvKUdwOAlkR6DDSnZaY="
                            alt="LandingpageImage"
                            className="img-fluid rounded hero-image"
                        />
                    </div>
                </div>

                {/* TOPNOTCH section */}
                <div className="row bg-body-tertiary security-section" id="solutions">
                    <div className="col-12 text-center mb-3">
                        <h4 className="security-title">Top-Notch Secured Technology</h4>
                    </div>

                    <div className="col-12 text-center mb-4">
                        <p className="security-subtitle">
                            Because true innovation starts with uncompromising security.
                        </p>
                    </div>

                    {/* FIRST ROW */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-database-lock fs-1 text-primary"></i>
                            <h4>AceCloud Secured Server</h4>
                            <p>
                                Hosted on India-based AceCloud servers built with multi-layer protection
                                and internationally certified security standards.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-filetype-key fs-1 text-primary"></i>
                            <h4>Encrypted Data</h4>
                            <p>
                                All your data is encrypted at rest and safely transmitted over protected
                                HTTPS/SSL channels to prevent unauthorised access.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-lock-fill fs-1 text-primary"></i>
                            <h4>Strict Data Privacy</h4>
                            <p>
                                All your data is encrypted at rest and safely transmitted over protected
                                HTTPS/SSL channels to prevent unauthorised access.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-person-fill-gear fs-1 text-primary"></i>
                            <h4>Role-based Access</h4>
                            <p>
                                Granular permission settings guarantee that users only see and access
                                what they are authorised to work on.
                            </p>
                        </div>
                    </div>

                    {/* SECOND ROW */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-shield-shaded fs-1 text-primary"></i>
                            <h4>Active Firewall Defence</h4>
                            <p>
                                Multi-layer firewall security continuously monitors and blocks
                                unauthorised attempts.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-search fs-1 text-primary"></i>
                            <h4>Regular Security Audits</h4>
                            <p>
                                Routine audits, system checks, and vulnerability assessments maintain
                                long-term stability.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-pc-display-horizontal fs-1 text-primary"></i>
                            <h4>Complete Digital Presence</h4>
                            <p>
                                We optimize your LinkedIn profile, Google Business Profile, articles and
                                blogs to improve visibility.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-lg-3">
                        <div className="security-card">
                            <i className="bi bi-telephone-outbound-fill fs-1 text-primary"></i>
                            <h4>Continuous Optimization & Support</h4>
                            <p>
                                We ensure your platform remains fast, secure, and reliable at all times. Our team regularly fine-tunes performance, applies updates, and provides ongoing support.
                            </p>
                        </div>
                    </div>
                </div>

                {/* TOPNOTCH section */}

                {/* Office Management Solution */}
                <div className="row bg-body-tertiary office-section" id="office">
                    <div className="col-12 text-center mb-3">
                        <h4 className="office-title">
                            Why Do You Need an Office Management Solution?
                        </h4>
                    </div>

                    <div className="col-12 text-center mb-5">
                        <p className="text-secondary office-subtitle">
                            Transform the way your office runs — from chaos to complete control.
                        </p>
                    </div>

                    {/* SECTION 1 */}
                    <div className="col-12 col-lg-6 office-text">
                        <h4>Smart Appointment Scheduling</h4>
                        <p>
                            Clients can book appointments directly through your website anytime.
                            Automated reminders reduce missed appointments and follow-ups.
                            Schedules stay organized with real-time updates and confirmations.
                        </p>
                    </div>

                    <div className="col-12 col-lg-6 office-image">
                        <img
                            src="https://kartra.com/wp-content/uploads/2025/01/appointment-hero.webp"
                            className="img-fluid"
                            alt="Appointment"
                        />
                    </div>

                    {/* SECTION 2 */}

                    <div className="col-12 col-lg-6 office-text">
                        <h4>All Documents in One Place</h4>
                        <p>
                            All client documents are stored securely in a centralized location.
                            No paperwork, no lost files, and no manual handling.
                        </p>
                    </div>
                    <div className="col-12 col-lg-6 office-image">
                        <img src={document} className="img-fluid" alt="Documents" />
                    </div>

                    {/* SECTION 3 */}
                    <div className="col-12 col-lg-6 office-text">
                        <h4>Service Requests</h4>
                        <p>
                            Structured intake forms collect detailed client information upfront.
                            Reduces back-and-forth communication and improves turnaround time.
                        </p>
                    </div>

                    <div className="col-12 col-lg-6 office-image">
                        <img src={servicereq} className="img-fluid" alt="Service Requests" />
                    </div>

                    {/* SECTION 4 */}

                    <div className="col-12 col-lg-6 office-text">
                        <h4>Time & Billing</h4>
                        <p>
                            Track billable hours accurately. Automated invoice generation reduces
                            manual work and ensures transparent billing.
                        </p>
                    </div>
                    <div className="col-12 col-lg-6 office-image">
                        <img src={bill} className="img-fluid" alt="Billing" />
                    </div>
                </div>

                {/* Office Management Solution */}

                {/* Easytouse */}
                <div className="row">
                    <div className="col-12">
                        <section className="cd-hero">
                            <div className="cd-hero-content">
                                <h1>Easy to Use. Always Keep You Ahead.</h1>
                                <p>
                                    Manage Your Office and Employees in a Smarter Way with Consultdesk360.
                                </p>

                                <Link to="/demo">
                                    <button className="cd-hero-btn">Book a Demo</button>
                                </Link>
                            </div>

                            <div className="cd-hero-image">
                                <div className="cd-hero-circle">
                                    <img src={heroImage} alt="Professional" />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                {/* Easytouse */}

                {/* without Boundaries */}
                <div className="row">
                    <div className="col-12">
                        <section className="cb-work">
                            {/* IMAGE */}
                            <div className="cb-work-img">
                                <div className="cb-img-card">
                                    <img
                                        src="https://img.freepik.com/free-photo/successful-casual-copywriter-typing-her-laptop-front-camera_482257-122451.jpg?semt=ais_hybrid&w=740&q=80"
                                        alt="Work Anywhere"
                                    />
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="cb-work-content">
                                <h2>Work Without Boundaries</h2>
                                <p className="cb-subtitle">Your Practice. Accessible Anywhere.</p>

                                <ul className="cb-list">
                                    <li>
                                        <span className="cb-check">✔</span>
                                        <div>
                                            <strong>Cloud-Based Access</strong>
                                            <p>Work from anywhere with no installation.</p>
                                        </div>
                                    </li>

                                    <li>
                                        <span className="cb-check">✔</span>
                                        <div>
                                            <strong>Always Organized</strong>
                                            <p>Keep tasks and teams structured.</p>
                                        </div>
                                    </li>

                                    <li>
                                        <span className="cb-check">✔</span>
                                        <div>
                                            <strong>Real-Time Tracking</strong>
                                            <p>Monitor progress live.</p>
                                        </div>
                                    </li>

                                    <li>
                                        <span className="cb-check">✔</span>
                                        <div>
                                            <strong>Flexible and Hassle-Free</strong>
                                            <p>Stay productive on any device.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
                {/* without Boundaries */}

                {/* Clients Testimonials */}
                <div className="row" id="testimonials">
                    <div className="col-12">
                        <section className="cd-testimonial">
                            <div className="cd-testimonial-wrap">

                                {/* LEFT */}
                                <div className="cd-testimonial-left">
                                    <h2>
                                        What Our <br /> Clients Say
                                    </h2>
                                    <p>Hear how consultdesk360 is transforming offices across India.</p>
                                </div>

                                {/* RIGHT */}
                                <div className="cd-testimonial-right">
                                    <div className="cd-testimonial-card">
                                        <p>
                                            Consultdesk360 Platform CA Management Software is a game-changer! Its seamless
                                            automation, accuracy, and user-friendly interface make financial
                                            management effortless. Highly recommended for efficiency-driven
                                            CA professionals.
                                        </p>

                                        <div className="cd-testimonial-user">
                                            <img
                                                src="https://i.pravatar.cc/100?img=12"
                                                alt="User"
                                            />
                                            <div>
                                                <h4>Anil Kumar</h4>
                                                <span>T Anil & Co (Chartered Accountants)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                {/* Clients Testimonials */}

                {/* CTA Section */}
                <div className="row">
                    <div className="col-12">
                        <section className="cd-cta">
                            {/* LEFT */}
                            <div className="cd-cta-left">
                                <div className="cd-cta-bg">
                                    <img
                                        src="https://static.vecteezy.com/system/resources/previews/036/297/763/non_2x/ai-generated-business-woman-showing-thumbs-up-on-a-transparent-background-free-png.png"
                                        alt="Dashboard"
                                        className="cd-cta-img"
                                    />
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="cd-cta-right">
                                <h2>
                                    Ready to Grow Your Tax Practice?
                                    <br />
                                    <span>Get Started Today</span>
                                </h2>

                                <p>
                                    Manage Your Office and Employees in a Smarter Way with Consultdesk360.
                                </p>

                                <div className="cd-cta-buttons">
                                    <Link to="/demo">
                                        <button className="cd-cta-btn">Book a Demo</button>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                {/* CTA Section */}

                {/* Pricing Section */}
                <div className="pricing-section" id="pricing">
                    <h1 className="pricing-title">Simple, Transparent Pricing</h1>

                    <div className="pricing-cards">
                        {/* Starter Plan */}
                        <div className="pricing-card">
                            <div className="card-header">
                                <h3>Starter Plan</h3>
                                <h2>₹9,999</h2>
                                <p>/Year</p>
                            </div>
                            <div className="card-body">
                                <ul>
                                    <li>Single Page Website.</li>
                                    <li>Practice Management Application.</li>
                                </ul>
                            </div>
                            <div className="card-footer">
                                <Link to='/contact'><button className="btn" style={{ backgroundColor: "#2b9bbd", color: "white", fontWeight: "bold", padding: "17px", fontSize: "13px", width: "80%" }}>Get Started</button></Link>
                            </div>
                        </div>

                        {/* Growth Plan */}
                        <div className="pricing-card featured">
                            <div className="card-header">
                                <h3>Growth Plan</h3>
                                <h2>₹25,000</h2>
                                <p>/Year</p>
                                {/* <p className="small-text">+ (Exclusive Gst)</p> */}
                                {/* <p className="maintenance">
                                    Annual Maintenance <br />
                                    <strong>₹10,000</strong>
                                </p> */}
                            </div>
                            <div className="card-body">
                                <ul>
                                    <li>One-time investment for website setup.</li>
                                    <li>Domain.</li>
                                    <li>Hosting.</li>
                                    <li>Platform configuration & initial optimization.</li>
                                    <li>Yearly platform maintenance.</li>
                                    <li>
                                        Updates, monthly blog + LinkedIn articles, GMB & SEO support.
                                    </li>
                                </ul>
                            </div>
                            <div className="card-footer">
                                <Link to='/contact'><button className="btn" style={{ backgroundColor: "#2b9bbd", color: "white", fontWeight: "bold", padding: "17px", fontSize: "13px", width: "80%" }}>Get Started</button></Link>
                            </div>
                        </div>

                        {/* Scale Plan */}
                        <div className="pricing-card">
                            <div className="card-header">
                                <h3>Scale Plan</h3>
                                <h2>₹1,00,000</h2>
                                <p>/Year</p>
                            </div>
                            <div className="card-body">
                                <ul>
                                    <li>
                                        Customized Website with SEO Optimization, Blogs, Web Application.
                                    </li>
                                    <li>Domain.</li>
                                    <li>Hosting.</li>
                                    <li>Platform configuration & initial optimization.</li>
                                    <li>
                                        Social Media Content Optimization, Social Media Management.
                                    </li>
                                    <li>LinkedIn Optimization, GMB.</li>
                                    <li>Educational Content postings.</li>
                                    <li>Announcements & Greetings of Gst, Tax etc.</li>
                                </ul>
                            </div>
                            <div className="card-footer">
                                <Link to='/contact'><button className="btn" style={{ backgroundColor: "#2b9bbd", color: "white", fontWeight: "bold", padding: "17px", fontSize: "13px", width: "80%" }}>Get Started</button></Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Pricing Section */}
            </div>
            {/* <Footer/> */}
            <footer className="footer">
                <div className="footer-top">

                    {/* COLUMN 4 */}
                    <div className="footer-col">
                        <img
                            src={rvlogo}
                            alt="Google Play"
                            className="playstore"
                        />
                        <div className="socials">
                            <a href="https://www.linkedin.com/company/110914202/admin/dashboard/" target="_blank" className="text-white"><span><i class="bi bi-linkedin"></i></span></a>
                            <a href="https://x.com/consultdesk360" target="_blank" className="text-white"><span><i class="bi bi-twitter"></i></span></a>
                            <a href="https://www.facebook.com/profile.php?id=61585996373118" target="_blank" className="text-white"><span><i class="bi bi-facebook"></i></span></a>
                            <a href="https://www.instagram.com/consultdesk360/" target="_blank" className="text-white"><span><i class="bi bi-instagram"></i></span></a>
                            <a href="https://www.youtube.com/channel/UCXctrlSKsHqUpgxN7_pjkNw" target="_blank" className="text-white"><span><i class="bi bi-youtube"></i></span></a>
                        </div>

                        <p className="footer-desc">
                            Consultdesk360 is an office management software for Chartered accountants
                            and accounting firms that provides tasks, employee and client
                            management.
                        </p>
                    </div>


                    {/* COLUMN 1 */}
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#office">Solutions</a></li>
                            <li><a href="#solutions">Features</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#testimonials">Testimonials</a></li>
                            <li><a href="#contact">Support & Help</a></li>
                        </ul>
                    </div>

                    {/* COLUMN 2 */}
                    <div className="footer-col">
                        <h4>Useful links</h4>
                        <ul>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/contact">Signup</Link></li>
                            <li><Link to="/demo">Free Demo</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>


                    {/* COLUMN 3 */}
                    <div className="footer-col">
                        <h4>Get in touch</h4>
                        <p className="label">Sales</p>
                        <p className="contact">📞 +91 8977108950</p>

                        <p className="label">Email</p>
                        <p className="contact">✉️ info@ridgeveda.com</p>

                        <img src="https://www.nicepng.com/png/full/24-243000_download-our-app-from-playstore.png" style={{width:"160px",height:"70px"}} alt="playstore"/>
                        <p>coming soon...</p>
                    </div>



                </div>




                {/* BOTTOM SECTION */}
                {/* <div className="footer-bottom">
                    <div className="footer-left">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play"
                        className="playstore"
                      />
            
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
            
                    <div className="footer-right">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/05/Meta_Platforms_Inc._logo.svg"
                        alt="Meta Partner"
                        className="meta-badge"
                      />
                      <p className="meta-text">Business Partner</p>
                    </div>
                  </div> */}

                <div className="footer-copy">
                    © 2025 Ridgeveda Solutions Private Limited. All rights reserved
                </div>
            </footer>
        </>
    );
};
export default Landingpage;