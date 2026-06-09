import React, { useMemo } from 'react';
import { useCMSData } from '../../hooks/useCMSData';

export default function Skills() {
  const { data: skillsData, loading } = useCMSData('data/skills');

  const sortedSkills = useMemo(() => {
    if (!skillsData || skillsData.length === 0) return [];
    return [...skillsData].sort((a, b) => (parseInt(a.order) ?? 999) - (parseInt(b.order) ?? 999));
  }, [skillsData]);

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('lang')) return 'fas fa-code';
    if (cat.includes('backend') || cat.includes('cloud')) return 'fas fa-server';
    if (cat.includes('frontend')) return 'fas fa-desktop';
    return 'fas fa-cubes';
  };

  return (
    <section id="skills">
      <h2 className="section-title">
        <i className="fas fa-layer-group" style={{ color: 'var(--accent)' }}></i> Skills Stack
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Skills...</p>}
      {!loading && sortedSkills.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No skills published yet.</p>}

      <div className="bento-grid">
        {sortedSkills.map((c, i) => (
          <div key={i} className="bento-card">
            <h3>
              <i className={getCategoryIcon(c.category)}></i>
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
