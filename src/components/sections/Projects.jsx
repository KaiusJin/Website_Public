import React, { useMemo } from 'react';
import { useCMSData, getSortDate } from '../../hooks/useCMSData';

export default function Projects({ isActive }) {
    const { data: projectsData, loading } = useCMSData('data/projects');

    const filteredProjects = useMemo(() => {
        if (!projectsData) return [];

        return projectsData
            .sort((a, b) => {
                const orderA = parseInt(a.order) ?? 999;
                const orderB = parseInt(b.order) ?? 999;
                if (orderA !== orderB) return orderA - orderB;
                return getSortDate(b) - getSortDate(a);
            });
    }, [projectsData]);

    const formatDateBadge = (item) => {
        let start = item.start_date;
        let end = item.is_present ? 'Present' : item.end_date;
        
        if (!start && item.date_badge) {
            // Robust splitting for various dash formats
            if (item.date_badge.includes('-')) {
                const parts = item.date_badge.split('-').map(s => s.trim());
                start = parts[0];
                end = end || parts[1];
            } else {
                start = item.date_badge;
            }
        }

        return (
            <span className={`year-badge ${end ? 'double-line' : 'one-line'}`}>
                <span>{start || ''}</span>
                {end && (
                    <>
                        <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>-</span>
                        <span>{end}</span>
                    </>
                )}
            </span>
        );
    };

    return (
        <section id="project" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Projects</h1>
            <div className="card-grid" id="projects-container">
                {loading && <p style={{ color: '#786657' }}>Loading Projects...</p>}
                {!loading && filteredProjects.length === 0 && <p style={{ color: '#786657' }}>No projects found.</p>}
                {filteredProjects.map((p, i) => (
                    <div key={i} className="info-card project-card">
                        <div className="card-header">
                            <h3>{p.title}</h3>
                            {formatDateBadge(p)}
                        </div>
                        <ul className="card-bullets">
                            {(p.bullets || []).map((b, j) => (
                                <li key={j}>{b.text}</li>
                            ))}
                        </ul>
                        <div className="skills-list" style={{ marginTop: '20px' }}>
                            {(p.skills || []).map((s, j) => (
                                <span key={j} className="skill-tag">{s.tag}</span>
                            ))}
                        </div>
                        <div className="card-actions">
                            {p.github_link && (
                                <a href={p.github_link} target="_blank" rel="noopener noreferrer" className="github-btn" style={{ marginRight: '10px' }}>
                                    <i className="fab fa-github"></i> GitHub Repo
                                </a>
                            )}
                            {p.link && (
                                <a href={p.link} target="_blank" rel="noopener noreferrer" className="github-btn" style={{ background: 'linear-gradient(135deg, #264653 0%, #2a9d8f 100%)' }}>
                                    <i className="fas fa-external-link-alt"></i> {p.link_text || 'Visit Website'}
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
