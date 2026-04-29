import React, { useMemo } from 'react';
import { useCMSData, getSortDate } from '../../hooks/useCMSData';

export default function Experience({ isActive }) {
    const { data: experiencesData, loading } = useCMSData('data/experiences');

    const filteredExperiences = useMemo(() => {
        if (!experiencesData) return [];

        return experiencesData
            .sort((a, b) => {
                const orderA = parseInt(a.order) || 100;
                const orderB = parseInt(b.order) || 100;
                if (orderA !== orderB) return orderA - orderB;
                return getSortDate(b) - getSortDate(a);
            });
    }, [experiencesData]);

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

        return <span className="year-badge one-line">{start}{end ? ' - ' + end : ''}</span>;
    };

    return (
        <section id="experience" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Work Experience</h1>
            <div className="resume-list" id="experiences-container">
                {loading && <p style={{ color: '#786657', textAlign: 'center' }}>Loading Experiences...</p>}
                {!loading && filteredExperiences.length === 0 && <p style={{ color: '#786657', textAlign: 'center' }}>No experiences published yet.</p>}
                {filteredExperiences.map((e, i) => (
                    <details key={i} className="resume-accordion">
                        <summary className="resume-summary">
                            <div className="rs-left">
                                <i className="fas fa-chevron-right toggle-icon"></i>
                                <h3>{e.title}</h3>
                            </div>
                            <div className="rs-date">
                                {formatDateBadge(e)}
                            </div>
                            <div className="rs-middle">
                                <h2><i className={e.role_icon || 'fas fa-users-cog'}></i> {e.role}</h2>
                            </div>
                            <div className="rs-right"><span className="click-hint">Click to expand</span></div>
                        </summary>
                        <div className="resume-details">
                            <ul className="card-bullets">
                                {(e.bullets || []).map((b, j) => (
                                    <li key={j}>{b.text}</li>
                                ))}
                            </ul>
                            {e.link && (
                                <div className="resume-actions">
                                    <a href={e.link} target="_blank" rel="noopener noreferrer" className="resume-link-btn">
                                        <i className="fas fa-external-link-alt"></i> {e.link_text || 'Visit Official Website'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}
