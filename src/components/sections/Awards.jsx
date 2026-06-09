import React, { useMemo } from 'react';
import { useCMSData } from '../../hooks/useCMSData';

export default function Awards() {
  const { data: awardsData, loading } = useCMSData('data/awards');

  const filteredAwards = useMemo(() => {
    if (!awardsData || awardsData.length === 0) return [];

    return [...awardsData].sort((a, b) => {
      const orderA = parseInt(a.order) ?? 999;
      const orderB = parseInt(b.order) ?? 999;
      return orderA - orderB;
    });
  }, [awardsData]);

  return (
    <section id="awards">
      <h2 className="section-title">
        <i className="fas fa-award" style={{ color: 'var(--accent)' }}></i> Honors & Certifications
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Awards...</p>}
      {!loading && filteredAwards.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No awards published yet.</p>
      )}

      <div className="card-grid">
        {filteredAwards.map((a, i) => (
          <div key={i} className="card award-card">
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
              {a.organization || (a.org_and_year ? a.org_and_year.split('·')[0].trim() : '')}
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

            {(a.link || a.cert_link) && (
              <div className="card-actions" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <a
                  href={a.link || a.cert_link}
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
