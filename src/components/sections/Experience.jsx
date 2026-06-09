import React, { useMemo } from 'react';
import { useCMSData, getSortDate } from '../../hooks/useCMSData';

export default function Experience() {
  const { data: experiencesData, loading: experiencesLoading } = useCMSData('data/experiences');

  const filteredExperiences = useMemo(() => {
    if (!experiencesData) return [];

    return experiencesData
      .sort((a, b) => {
        const orderA = parseInt(a.order) ?? 999;
        const orderB = parseInt(b.order) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return getSortDate(b) - getSortDate(a);
      });
  }, [experiencesData]);

  const formatDateBadge = (item) => {
    let start = item.start_date;
    let end = item.is_present ? 'Present' : item.end_date;

    if (!start && item.date_badge) {
      if (item.date_badge.includes('-')) {
        const parts = item.date_badge.split('-').map(s => s.trim());
        start = parts[0];
        end = end || parts[1];
      } else {
        start = item.date_badge;
      }
    }

    return `${start}${end ? ' - ' + end : ''}`;
  };

  return (
    <section id="experience">
      <h2 className="section-title">
        <i className="fas fa-briefcase" style={{ color: 'var(--accent)' }}></i> Work Experience
      </h2>

      {experiencesLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading Experiences...</p>}
      {!experiencesLoading && filteredExperiences.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No experiences published yet.</p>
      )}

      <div className="timeline-container">
        {filteredExperiences.map((e, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-title-area">
                  <h3>{e.title}</h3>
                  <h4>
                    <i className={e.role_icon || 'fas fa-users-cog'}></i>
                    {e.role}
                  </h4>
                </div>
                <span className="timeline-date">{formatDateBadge(e)}</span>
              </div>

              <div className="timeline-body">
                <ul className="timeline-bullets">
                  {(e.bullets || []).map((b, j) => (
                    <li key={j}>{b.text}</li>
                  ))}
                </ul>
                {e.link && (
                  <div className="timeline-actions">
                    <a href={e.link} target="_blank" rel="noopener noreferrer">
                      {e.link_text || 'Visit Official Website'} <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
