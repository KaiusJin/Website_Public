import { useCMSData } from '../../hooks/useCMSData';

export default function Skills() {
  const { data: skillsData, loading, error } = useCMSData('skills');

  return (
    <section id="skills">
      <h2 className="section-title">
        <i className="fas fa-layer-group" style={{ color: 'var(--accent)' }}></i> Skills Stack
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Skills...</p>}
      {!loading && error && <p role="alert" style={{ color: 'var(--text-secondary)' }}>Skills could not be loaded.</p>}
      {!loading && !error && skillsData.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No skills yet.</p>}

      <div className="bento-grid">
        {skillsData.map((c) => (
          <div key={c.id} className="bento-card">
            <h3>
              <i className={c.category_icon} aria-hidden="true"></i>
              {c.category}
            </h3>
            <div className="bento-skills">
              {(c.skills || []).map((s, j) => (
                <span key={j} className="skill-capsule">{s.tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
