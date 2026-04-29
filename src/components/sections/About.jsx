import React, { useMemo } from 'react';
import { useCMSData } from '../../hooks/useCMSData';

export default function About({ isActive }) {
    const { data: skillsData, loading } = useCMSData('data/skills');

    const sortedSkills = useMemo(() => {
        if (!skillsData || skillsData.length === 0) return [];
        const skillOrder = ["Language", "Framework", "Tool"];
        return [...skillsData].sort((a, b) => {
            let idxA = skillOrder.findIndex(p => (a.category || "").toLowerCase().includes(p.toLowerCase()));
            let idxB = skillOrder.findIndex(p => (b.category || "").toLowerCase().includes(p.toLowerCase()));
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return 0;
        });
    }, [skillsData]);

    return (
        <section id="about" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Kaius Jin</h1>
            <div className="card-grid">
                <div className="info-card">
                    <h2><i className="fas fa-user-graduate"></i> Profile</h2>
                    <p>I am a <strong>2A Computer Science student</strong> at the <strong>University of Waterloo</strong>, pursuing a 
                        <span style={{ color: '#e76f51', fontWeight: 600 }}> Bachelor of Honors Computer Science</span> with a 
                        <span style={{ color: '#e76f51', fontWeight: 600 }}> AI Specialization </span> 
                        and a <span style={{ color: '#e76f51', fontWeight: 600 }}> Computation Optimization Minor</span>.
                    </p>
                    <ul>
                        <li>GPA: 4.0/4.0</li>
                        <li>Grade: 92.8</li>
                    </ul>
                </div>
                <div className="info-card">
                    <h2><i className="fas fa-layer-group"></i> Skills Stack</h2>
                    <div id="skills-container">
                        {loading && <p style={{ color: '#786657' }}>Loading Skills...</p>}
                        {!loading && sortedSkills.length === 0 && <p style={{ color: '#786657' }}>No skills published yet.</p>}
                        {sortedSkills.map((c, i) => (
                            <div key={i} style={{ marginBottom: '12px' }}>
                                <h4 style={{ margin: '0 0 6px 0', color: '#a49687', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.category}</h4>
                                <div className="skills-list">
                                    {(c.skills || []).map((s, j) => (
                                        <span key={j} className="skill-tag">{s.tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* GitHub Activity Section */}
            <div className="github-activity-section" style={{ marginTop: '2rem' }}>
                <div className="info-card">
                    <h2><i className="fab fa-github"></i> GitHub Contributions</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#786657', fontSize: '0.9rem' }}>
                        A visual footprint of my open-source activities and project commits.
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(120, 102, 87, 0.2)' }}>
                        <img 
                            src="https://ghchart.rshah.org/e76f51/KaiusJin" 
                            alt="Kaius Jin's GitHub Chart" 
                            style={{ width: '100%', filter: 'invert(0.1) brightness(1.1)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
