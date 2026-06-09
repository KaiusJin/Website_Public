import React, { useMemo, useEffect } from 'react';
import { useCMSData, getSortDate } from '../../hooks/useCMSData';
import ProjectRow from './ProjectRow';

export default function AllProjects({ onBack }) {
  const { data: projectsData, loading } = useCMSData('data/projects');

  // Scroll to top instantly when this page mounts or finishes loading
  useEffect(() => {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    // Force layout reflow
    document.documentElement.offsetHeight;
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
  }, [loading]);

  const sortedProjects = useMemo(() => {
    if (!projectsData) return [];

    return projectsData
      .sort((a, b) => {
        const orderA = parseInt(a.order) ?? 999;
        const orderB = parseInt(b.order) ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return getSortDate(b) - getSortDate(a);
      });
  }, [projectsData]);

  return (
    <div className="all-projects-page">
      {/* Floating Subpage Navbar */}
      <header className="navbar-container all-projects-navbar" role="navigation" aria-label="Archive Navigation">
        <div className="navbar-content">
          <div className="navbar-logo" onClick={onBack} style={{ cursor: 'pointer' }}>
            Kaius <span>Jin</span>
          </div>
          <button onClick={onBack} className="navbar-back-link">
            <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i> Back to Home
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="all-projects-content">
        <div className="all-projects-header">
          <h1 className="all-projects-title">
            <i className="fas fa-archive" style={{ color: 'var(--accent)' }}></i> All Projects
          </h1>
        </div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Project Archive...</p>}
        {!loading && sortedProjects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}

        <div className="projects-list-wrapper">
          {sortedProjects.map((p, i) => (
            <ProjectRow key={p.id || i} project={p} index={i} />
          ))}
        </div>

        <div className="all-projects-footer-action">
          <button onClick={onBack} className="btn btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Homepage
          </button>
        </div>
      </main>
    </div>
  );
}
