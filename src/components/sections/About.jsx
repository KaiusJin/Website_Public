import React from 'react';

export default function About() {
  return (
    <section id="about">
      <h2 className="section-title">
        <i className="fas fa-address-card" style={{ color: 'var(--accent)' }}></i> Profile & Background
      </h2>

      <div className="about-layout" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        <div className="about-bio">
          <p>
            I am a <strong>Computer Science student</strong> at the <strong>University of Waterloo</strong>. I enjoy turning complex backend workflows and infrastructure challenges into clean, reliable, and performant tools.
          </p>
          <p>
            My technical focus lies in <strong>backend systems, cloud infrastructure, and AI-powered applications</strong>. Whether designing data pipelines, developing API layers, or automating deployments, I aim to write code with exceptional clarity, reliability, and practical impact.
          </p>
          <p>
            I am always eager to collaborate on challenging projects and explore opportunities for co-op terms, software development work, and open-source innovations.
          </p>
        </div>

        <div className="about-info-card">
          <h3 className="about-info-title">Personal Summary</h3>
          <div className="about-info-list">
            <div className="about-info-item">
              <span className="about-info-label">Location</span>
              <span className="about-info-value">Waterloo, Canada</span>
            </div>
            <div className="about-info-item">
              <span className="about-info-label">Education</span>
              <span className="about-info-value">University of Waterloo, CS</span>
            </div>
            <div className="about-info-item">
              <span className="about-info-label">Focus Areas</span>
              <span className="about-info-value">Backend / Cloud / AI Tools</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
