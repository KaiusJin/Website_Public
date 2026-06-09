import React, { useEffect, useState } from 'react';

const contactSlogans = [
  'I turn scattered signals into working systems.',
  'I build software that survives real users.',
  'I make AI feel sharp, useful, and fast.',
  'I connect algorithms with human problems.'
];

export default function Contact() {
  const [activeSlogan, setActiveSlogan] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlogan((current) => (current + 1) % contactSlogans.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-layout">
        <div className="contact-left-panel">
          <h2 className="section-title">
            <i className="fas fa-paper-plane" style={{ color: 'var(--accent)' }}></i> Contact Me
          </h2>

          <div className="contact-info-list">
            {/* Email Item */}
            <div className="contact-info-item">
              <div className="contact-info-icon-badge">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-info-details">
                <span className="contact-info-label">EMAIL</span>
                <a href="mailto:kaius.jin@outlook.com" className="contact-info-value-link">
                  kaius.jin@outlook.com
                </a>
              </div>
            </div>

            {/* Location Item */}
            <div className="contact-info-item">
              <div className="contact-info-icon-badge">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-info-details">
                <span className="contact-info-label">LOCATION</span>
                <span className="contact-info-value-text">
                  Waterloo, ON, Canada
                </span>
              </div>
            </div>
          </div>

          {/* Minimalist Social Links */}
          <div className="contact-social-row">
            <a
              href="https://github.com/KaiusJin"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/kaixuan-jin/"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://devpost.com/kaixuan-jin?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav"
              target="_blank"
              rel="noopener noreferrer"
              title="Devpost"
            >
              <i className="fas fa-laptop-code"></i>
            </a>
          </div>
        </div>

        <div className="contact-slogan-panel" aria-live="polite">
          <div key={activeSlogan} className="contact-slogan-text">
            {contactSlogans[activeSlogan]}
          </div>
        </div>
      </div>
    </section>
  );
}
