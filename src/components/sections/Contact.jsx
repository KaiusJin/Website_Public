import { useEffect, useState } from 'react';
import { safeUrl } from '../../journey/data/content';

const contactSlogans = [
  'I turn scattered signals into working systems.',
  'I build software that survives real users.',
  'I make AI feel sharp, useful, and fast.',
  'I connect algorithms with human problems.'
];

export default function Contact({ profile, loading, error }) {
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

          {loading && <p role="status">Loading contact details…</p>}
          {error && <p role="alert">Contact details could not be loaded.</p>}
          <div className="contact-info-list">
            {profile.email && <div className="contact-info-item">
              <div className="contact-info-icon-badge">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-info-details">
                <span className="contact-info-label">EMAIL</span>
                <a href={`mailto:${profile.email}`} className="contact-info-value-link">
                  {profile.email}
                </a>
              </div>
            </div>

            }

            {/* Location Item */}
            {profile.location && <div className="contact-info-item">
              <div className="contact-info-icon-badge">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-info-details">
                <span className="contact-info-label">LOCATION</span>
                <span className="contact-info-value-text">
                  {profile.location}
                </span>
              </div>
            </div>
            }
          </div>

          <div className="contact-social-row">
            {[
              ['GitHub', profile.github, 'fab fa-github'],
              ['LinkedIn', profile.linkedin, 'fab fa-linkedin'],
              ['Download résumé', profile.resume_url, 'fas fa-file-pdf'],
            ].map(([label, href, icon]) => safeUrl(href) && (
              <a key={label} href={safeUrl(href)} target="_blank" rel="noopener noreferrer" title={label} aria-label={label}>
                <i className={icon} aria-hidden="true" />
                {label === 'Download résumé' && <span> Résumé</span>}
              </a>
            ))}
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
