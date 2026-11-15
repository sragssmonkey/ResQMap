
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import './HomeEnhancements.css';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`home-page ${darkMode ? 'theme-dark' : 'theme-light'}`}>

      {/* NAVIGATION */}
      <nav className="home-nav wrap">
        <Brand light={darkMode} />

        <div className="nav-actions">
          <a href="#how-it-works">How it works</a>
          <a href="#platform">Platform</a>
          <a href="#risk-intelligence">Risk intelligence</a>

          <Link
            to="/survivor/earthquake-map"
            className="nav-earthquake"
          >
            Earthquake Map ↗
          </Link>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀' : '☾'}
          </button>

          <Link className="nav-login" to="/login">
            Sign in <span>→</span>
          </Link>
        </div>
      </nav>

      <main>

        {/* HERO */}
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              DISASTER RESPONSE. CONNECTED.
            </div>

            <h1>
              When every second matters,
              <em> connection saves lives.</em>
            </h1>

            <p className="hero-sub">
              A shared response network connecting communities and rescue
              teams with timely, location-based disaster information.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary">
                Access your portal <span>→</span>
              </Link>

              <a href="#platform" className="text-link">
                Explore ResQMap ↓
              </a>
            </div>

            <div className="hero-note">
              <span className="shield">✓</span>
              One network. Two perspectives. A coordinated response.
            </div>
          </div>

          <div className="hero-visual">
            <div className="map-grid">
              <div className="map-line line-one" />
              <div className="map-line line-two" />
              <div className="map-line line-three" />
              <div className="map-river" />

              <div className="map-pin pin-a">＋</div>
              <div className="map-pin pin-b">⌂</div>
              <div className="map-pin pin-c">!</div>

              <div className="map-label label-a">COMMUNITY REPORT</div>
              <div className="map-label label-b">RELIEF POINT</div>

              <div className="map-card">
                <span className="live-dot" />
                RESPONSE NETWORK
                <strong>Connected</strong>
                <small>Community ↔ Rescue teams</small>
              </div>

              <div className="map-coordinates">
                18.9894° N &nbsp; 73.1175° E
              </div>
            </div>

            <div className="visual-caption">
              LOCATION-BASED SITUATIONAL AWARENESS
            </div>
          </div>
        </section>

        {/* PLATFORM OVERVIEW */}
        <section className="platform-section" id="platform">
          <div className="wrap">
            <div className="section-heading">
              <div className="eyebrow">THE RESQMAP ECOSYSTEM</div>
              <h2>
                More than a reporting platform.
                <em> A connected response system.</em>
              </h2>
              <p>
                ResQMap combines community reporting, rescue coordination,
                geographical information and machine learning to support
                disaster preparedness and response.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">⌖</div>
                <h3>Geospatial Intelligence</h3>
                <p>
                  Visualise incident locations and geographical information
                  through interactive maps.
                </p>
                <span>LOCATION-BASED MAPPING</span>
              </article>

              <article className="feature-card">
                <div className="feature-icon">⚑</div>
                <h3>Community Reporting</h3>
                <p>
                  Allow survivors to submit location-based emergency reports
                  and communicate urgent needs.
                </p>
                <span>COMMUNITY PARTICIPATION</span>
              </article>

              <article className="feature-card">
                <div className="feature-icon">✚</div>
                <h3>Rescue Coordination</h3>
                <p>
                  Help response teams review reports, verify incidents and
                  coordinate relief information.
                </p>
                <span>RESPONSE MANAGEMENT</span>
              </article>

              <article className="feature-card">
                <div className="feature-icon">⌁</div>
                <h3>AI-assisted Analysis</h3>
                <p>
                  Analyse incident descriptions and provide decision-support
                  insights using machine learning.
                </p>
                <span>INTELLIGENT ASSISTANCE</span>
              </article>
            </div>
          </div>
        </section>

        {/* RISK INTELLIGENCE */}
        <section className="risk-section" id="risk-intelligence">
          <div className="wrap risk-inner">
            <div className="risk-copy">
              <div className="eyebrow">MACHINE LEARNING × GEOSPATIAL DATA</div>

              <h2>
                Understand geographical patterns.
                <em> Prepare for what lies ahead.</em>
              </h2>

              <p>
                Explore ResQMap's experimental earthquake susceptibility
                model, developed using historical earthquake records and
                geographical grid-based analysis.
              </p>

              <ul className="risk-list">
                <li>Interactive geographical susceptibility map</li>
                <li>Machine-learning-based relative susceptibility scores</li>
                <li>Grid-level exploration of historical patterns</li>
                <li>Visual interpretation through colour-coded layers</li>
              </ul>

              <Link
                to="/survivor/earthquake-map"
                className="btn btn-primary"
              >
                Explore Earthquake Map <span>→</span>
              </Link>

              <p className="risk-note">
                Experimental susceptibility assessment, not an earthquake
                prediction or probability of occurrence.
              </p>
            </div>

            <div className="risk-visual">
              <div className="risk-visual-top">
                <span>RISK INTELLIGENCE</span>
                <span className="risk-live">MODEL OUTPUT</span>
              </div>

              <div className="risk-visual-map">
                <div className="risk-orb orb-one" />
                <div className="risk-orb orb-two" />
                <div className="risk-orb orb-three" />
                <div className="risk-map-label">INDIA · GRID ANALYSIS</div>
              </div>

              <div className="risk-visual-bottom">
                <div>
                  <strong>0.5°</strong>
                  <span>Grid resolution</span>
                </div>
                <div>
                  <strong>ML</strong>
                  <span>Model-assisted analysis</span>
                </div>
                <div>
                  <strong>GIS</strong>
                  <span>Spatial visualisation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PORTALS */}
        <section className="portal-section" id="portals">
          <div className="wrap">
            <div className="section-heading">
              <div className="eyebrow">BUILT FOR BOTH SIDES OF RESPONSE</div>
              <h2>
                One platform. <em>Two dedicated portals.</em>
              </h2>
              <p>
                Whether you're seeking help or coordinating it, ResQMap
                gives you the tools to act.
              </p>
            </div>

            <div className="portal-cards">
              <article className="portal-card survivor-card">
                <div className="portal-icon">⌖</div>
                <div className="card-kicker">FOR COMMUNITIES</div>
                <h3>Survivor portal</h3>
                <p>
                  Share what's happening around you. Report blocked roads,
                  emergencies and urgent needs. Find verified relief camp
                  information.
                </p>
                <ul>
                  <li>Submit location-based incident reports</li>
                  <li>Receive disaster and safety updates</li>
                  <li>Find nearby relief resources</li>
                </ul>
                <Link to="/login?portal=survivor" className="card-link">
                  Enter survivor portal <span>→</span>
                </Link>
              </article>

              <article className="portal-card rescue-card">
                <div className="portal-icon">✚</div>
                <div className="card-kicker">FOR RESPONSE TEAMS</div>
                <h3>Rescue team portal</h3>
                <p>
                  Turn incoming community information into coordinated
                  action. Keep teams informed and share trusted relief
                  information.
                </p>
                <ul>
                  <li>Review and verify incident reports</li>
                  <li>Publish relief camp information</li>
                  <li>Share team movement updates</li>
                </ul>
                <Link to="/login?portal=rescue" className="card-link">
                  Enter rescue portal <span>→</span>
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="workflow-section" id="how-it-works">
          <div className="wrap">
            <div className="section-heading">
              <div className="eyebrow">FROM INFORMATION TO ACTION</div>
              <h2>
                How <em>ResQMap works.</em>
              </h2>
              <p>
                A connected workflow that brings community information
                and response coordination together.
              </p>
            </div>

            <div className="workflow-grid">
              <article className="workflow-card">
                <span className="workflow-number">01</span>
                <div className="workflow-icon">⌖</div>
                <h3>Report</h3>
                <p>
                  Community members submit incidents with descriptions
                  and geographical locations.
                </p>
              </article>

              <article className="workflow-card">
                <span className="workflow-number">02</span>
                <div className="workflow-icon">⌕</div>
                <h3>Analyse & Verify</h3>
                <p>
                  Reports can be analysed and reviewed by authorised
                  response teams.
                </p>
              </article>

              <article className="workflow-card">
                <span className="workflow-number">03</span>
                <div className="workflow-icon">✚</div>
                <h3>Coordinate</h3>
                <p>
                  Rescue teams use verified information to support
                  coordinated response activities.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bottom-band">
          <div className="wrap bottom-inner">
            <div>
              <div className="eyebrow">RESQMAP</div>
              <h2>
                Better information.
                <em> Better coordinated response.</em>
              </h2>
              <p>
                Connect with the ResQMap disaster response network.
              </p>
            </div>

            <Link to="/login" className="btn btn-light">
              Get started <span>→</span>
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="home-footer wrap">
        <Brand />
        <span>
          Disaster information and response coordination platform.
        </span>
        <span>© {new Date().getFullYear()} ResQMap</span>
      </footer>

    </div>
  );
}
