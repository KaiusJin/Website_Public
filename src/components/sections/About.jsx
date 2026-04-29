import React, { useMemo } from 'react';
import { useCMSData } from '../../hooks/useCMSData';

export default function About({ isActive }) {
    const { data: skillsData, loading } = useCMSData('data/skills');

    const sortedSkills = useMemo(() => {
        if (!skillsData || skillsData.length === 0) return [];
        
        // 1. First, sort all skills by their individual order
        const sorted = [...skillsData].sort((a, b) => (parseInt(a.order) ?? 999) - (parseInt(b.order) ?? 999));
        
        // 2. Group them by category while maintaining the order discovered above
        const groups = [];
        sorted.forEach(skill => {
            let group = groups.find(g => g.category === skill.category);
            if (!group) {
                group = { category: skill.category, skills: [] };
                groups.push(group);
            }
            group.skills.push(skill);
        });
        return groups;
    }, [skillsData]);

    return (
        <section id="about" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Kaius Jin</h1>
            <div className="about-layout-grid">
                {/* Profile Card */}
                <div className="info-card profile-card">
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

                {/* Skills Card - Set to take full height on the right */}
                <div className="info-card skills-card">
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

                {/* GitHub Card - Below Profile on the left */}
                <div className="info-card github-card">
                    <h2><i className="fab fa-github"></i> GitHub Contributions</h2>
                    <p style={{ marginBottom: '1rem', color: '#786657', fontSize: '0.9rem' }}>
                        Open-source activities and project commits.
                    </p>
                    <div className="github-chart-wrapper">
                        <img 
                            src="https://ghchart.rshah.org/e76f51/KaiusJin" 
                            alt="Kaius Jin's GitHub Chart" 
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
