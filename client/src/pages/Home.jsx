import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const steps = [
  { icon: '📋', title: 'Report', desc: 'Report a lost or found item with details and a photo.' },
  { icon: '🔍', title: 'Search', desc: 'Browse items reported by the KJO University community.' },
  { icon: '🤝', title: 'Connect', desc: 'Submit a claim and connect with the person who reported the item.' },
  { icon: '✅', title: 'Recover', desc: 'Verify ownership and get your item back safely.' },
];

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">KJO University</div>
          <h1>
            Lost something <span>on campus?</span>
          </h1>
          <p>
            Found something that belongs to someone else?<br />
            <strong>COMPASS</strong> helps the KJO University community reconnect
            lost belongings with their owners.
          </p>
          <div className="hero-actions">
            <Link to="/report-lost" className="btn btn-accent btn-lg">
              📋 Report Lost Item
            </Link>
            <Link to="/report-found" className="btn btn-outline-white btn-lg">
              🎒 Report Found Item
            </Link>
          </div>
          <div className="hero-stats">
            <div><strong>Centralized</strong><span>Lost &amp; Found Hub</span></div>
            <div><strong>Secure</strong><span>University Only</span></div>
            <div><strong>Simple</strong><span>Easy to Use</span></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How COMPASS Works</h2>
          <p className="section-sub">Four simple steps to recover your belongings</p>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div className="step-card" key={i}>
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse CTA */}
      <section className="browse-cta">
        <div className="container">
          <div className="cta-grid">
            <div className="cta-card cta-lost">
              <div className="cta-icon">🔴</div>
              <h3>Browse Lost Items</h3>
              <p>See what members of the KJO community have reported as lost.</p>
              <Link to="/lost-items" className="btn btn-primary">View Lost Items →</Link>
            </div>
            <div className="cta-card cta-found">
              <div className="cta-icon">🟢</div>
              <h3>Browse Found Items</h3>
              <p>Someone may have found your item and reported it here.</p>
              <Link to="/found-items" className="btn btn-success">View Found Items →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand">
            <strong>COMPASS</strong> — KJO University Lost &amp; Found
          </div>
          <p>A platform exclusively for KJO University students and staff.</p>
          <p className="footer-note">© 2026 KJO University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
