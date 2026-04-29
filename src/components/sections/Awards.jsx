import React, { useMemo } from 'react';
import { useCMSData } from '../../hooks/useCMSData';

export default function Awards({ isActive }) {
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
        <section id="awards" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Honors & Certifications</h1>
            <div className="card-grid" id="awards-container">
                {loading && <p style={{ color: '#786657', textAlign: 'center', width: '100%' }}>Loading Awards...</p>}
                {!loading && filteredAwards.length === 0 && <p style={{ color: '#786657', textAlign: 'center', width: '100%' }}>No awards published yet.</p>}
                {filteredAwards.map((a, i) => (
                    <div key={i} className="award-card">
                        <div className="award-content">
                            <div className="award-header">
                                <h3>{a.title}</h3>
                            </div>
                            <p className="award-full-name">
                                {a.organization || a.year 
                                    ? [a.organization, a.year].filter(Boolean).join(' · ') 
                                    : (a.org_and_year || '')}
                            </p>
                            
                            {a.description && (
                                <p className="award-description" style={{ marginTop: '8px', color: '#5c4738', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {a.description}
                                </p>
                            )}
                            {a.bullets && a.bullets.length > 0 && (
                                <ul className="card-bullets" style={{ marginTop: '10px' }}>
                                    {a.bullets.map((b, j) => (
                                        <li key={j}>{b.text}</li>
                                    ))}
                                </ul>
                            )}                            
                            {a.cert_link && (
                                <div className="award-actions">
                                    <a href={a.cert_link} target="_blank" rel="noopener noreferrer" className="cert-link-btn">
                                        <i className="fas fa-certificate"></i> View Certificate
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
