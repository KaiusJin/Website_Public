
export default function About({ profile, loading, error }) {
  return (
    <section id="about">
      <h2 className="section-title">
        <i className="fas fa-address-card" style={{ color: 'var(--accent)' }}></i> Profile & Background
      </h2>

      {loading && <p role="status">Loading profile…</p>}
      {error && <p role="alert">Profile could not be loaded.</p>}
      {!loading && !error && <div className="about-layout" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        <div className="about-bio">
          {profile.heading && <h3>{profile.heading}</h3>}
          {profile.intro && <p style={{ whiteSpace: 'pre-line' }}>{profile.intro}</p>}
          {profile.bio && <p style={{ whiteSpace: 'pre-line' }}>{profile.bio}</p>}
        </div>

        <div className="about-info-card">
          <h3 className="about-info-title">Personal Summary</h3>
          <div className="about-info-list">
            {profile.location && <div className="about-info-item">
              <span className="about-info-label">Location</span>
              <span className="about-info-value">{profile.location}</span>
            </div>}
            {profile.education && <div className="about-info-item">
              <span className="about-info-label">Education</span>
              <span className="about-info-value">{profile.education}</span>
            </div>}
            {profile.focus_areas && <div className="about-info-item">
              <span className="about-info-label">Focus Areas</span>
              <span className="about-info-value">{profile.focus_areas}</span>
            </div>}
          </div>
        </div>
      </div>}
    </section>
  );
}
