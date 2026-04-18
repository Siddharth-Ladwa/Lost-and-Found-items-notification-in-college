import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SoftAurora from '../components/SoftAurora';
import { Search, PlusCircle, ArrowRight, UserCircle, ShieldCheck, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery.trim()) {
      logout();
      navigate('/login?redirect=search&q=' + encodeURIComponent(searchQuery));
    }
  };

  const mockMatches = [
    { item: "Apple AirPods Pro", location: "Main Library", time: "2 hours ago", status: "Reunited" },
    { item: "Blue Yeti Water Bottle", location: "Gymnasium", time: "5 hours ago", status: "Found" },
    { item: "Car Keys (Toyota)", location: "Parking Lot B", time: "1 day ago", status: "Reunited" },
    { item: "Calculus Textbook", location: "Science Building", time: "2 days ago", status: "Found" }
  ];

  return (
    <div className="landing-wrapper">
      {/* Navbar Layout */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => window.scrollTo(0, 0)}>
            <div className="logo-icon"></div>
            <span>Lost&Found</span>
          </div>
          <div className="nav-actions">
            <button className="btn-user-login" onClick={() => { logout(); navigate('/login'); }}>
              <UserCircle size={18} /> User Portal
            </button>
            <button className="btn-admin-login" onClick={() => { logout(); navigate('/login?role=admin'); }}>
              <ShieldCheck size={18} /> Admin Access
            </button>
          </div>
        </div>
      </nav>

      {/* Layout 1: Hero Search & Action */}
      <section className="layout-hero">
        <div className="hero-background">
          <SoftAurora speed={0.5} scale={1.2} brightness={1.1} color1="#f7f7f7" color2="#3a0ca3" noiseFrequency={2.0} enableMouseInteraction={true} mouseInfluence={0.3} />
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">Campus & Community Recovery System</div>
          <h1 className="hero-title">
            Did you lose something? <span>Let's find it.</span>
          </h1>
          <p className="hero-subtitle">
            Instantly search thousands of reported found items across the network, or broadcast a lost alert to the community.
          </p>
          
          <form className="hero-search-bar" onSubmit={handleSearch}>
            <Search className="search-icon-input" size={24} />
            <input 
              type="text" 
              placeholder="e.g., Black leather wallet, iPhone 13, Keys..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-submit-btn">Search Database</button>
          </form>
        </div>
      </section>

      {/* Layout 2: Interactive Dual Action Board */}
      <section id="actions" className="layout-actions">
        <div className="section-heading">
          <h2>How can we help you today?</h2>
          <p>Choose an action to get started immediately within our secure platform.</p>
        </div>
        
        <div className="action-split">
          <div className="action-card lost-card group" onClick={() => { logout(); navigate('/login?redirect=report-lost'); }}>
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="icon-circle lost-circle">
                <Search size={36} />
              </div>
              <h3>I Lost Something</h3>
              <p>File a detailed missing item report. Our smart system will continually cross-reference your item against all newly found items.</p>
              <div className="card-btn">File Lost Report <ArrowRight size={18} /></div>
            </div>
          </div>
          
          <div className="action-card found-card group" onClick={() => { logout(); navigate('/login?redirect=report-found'); }}>
            <div className="card-bg"></div>
            <div className="card-content">
              <div className="icon-circle found-circle">
                <PlusCircle size={36} />
              </div>
              <h3>I Found Something</h3>
              <p>Help someone out. Post an item you found to our secure database. We shield personal info until a match is confirmed.</p>
              <div className="card-btn">Report Found Item <ArrowRight size={18} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Layout 3: Live Community Showcase & Stats */}
      <section className="layout-community">
        <div className="community-wrapper glass-panel-dark">
          <div className="community-info">
            <h2>The system is working.</h2>
            <p>Our centralized platform actively reunites dozens of items every single day. See the latest success stories and system activity below.</p>
            
            <div className="live-stats">
              <div className="stat-item">
                <span className="stat-number">2,405</span>
                <span className="stat-label">Items Returned</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">Match Accuracy</span>
              </div>
            </div>
            
            <button className="btn-primary-glow mt-8" onClick={() => { logout(); navigate('/login'); }}>
              Join the Network
            </button>
          </div>
          
          <div className="community-feed">
            <div className="feed-header">
              <div className="pulse-dot"></div> Live Activity Feed
            </div>
            <div className="feed-list">
              {mockMatches.map((match, idx) => (
                <div key={idx} className="feed-card blur-in" style={{ animationDelay: `${idx * 0.2}s` }}>
                  <div className="feed-card-header">
                    <h4>{match.item}</h4>
                    <span className={`status-badge ${match.status.toLowerCase()}`}>
                      {match.status === 'Reunited' ? <CheckCircle2 size={14}/> : null} {match.status}
                    </span>
                  </div>
                  <div className="feed-card-meta">
                    <span><MapPin size={14}/> {match.location}</span>
                    <span><Clock size={14}/> {match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">Lost & Found Management System</div>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
