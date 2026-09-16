import { useCMSData } from '../../hooks/useCMSData';

export default function Awards() {
  const { data: awardsData, loading, error } = useCMSData('awards');

  return (
    <section id="awards">
      <h2 className="section-title">
        <i className="fas fa-award" style={{ color: 'var(--accent)' }}></i> Honors & Certifications
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Awards...</p>}
      {!loading && error && <p role="alert" style={{ color: 'var(--text-secondary)' }}>Awards could not be loaded.</p>}
      {!loading && !error && awardsData.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No awards yet.</p>
      )}

      <div className="card-grid">
        {awardsData.map((a) => (
          <div key={a.id} className="card award-card">
            <div className="award-heading-row">
              <h3 className="award-title">{a.title}</h3>
              <span className="date-badge">
                {a.year || ''}
              </span>
            </div>

            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                marginBottom: '16px'
              }}
            >
              {a.organization || ''}
            </div>

            {a.description && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                {a.description}
              </p>
            )}

            {a.bullets && a.bullets.length > 0 && (
              <ul className="card-bullets" style={{ marginBottom: '16px' }}>
                {a.bullets.map((b, j) => (
                  <li key={j} style={{ fontSize: '0.85rem' }}>{b.text}</li>
                ))}
              </ul>
            )}

            {a.link && (
              <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}
                >
                  {a.link_text || 'View Certificate'} <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
