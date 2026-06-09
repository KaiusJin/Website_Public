import React, { useMemo } from 'react';
import { useCMSData, getSortDate } from '../../hooks/useCMSData';
import ProjectRow from './ProjectRow';

export default function Projects({ onViewAll }) {
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

  // Only display the first 2 projects as featured on the home page
  const featuredProjects = useMemo(() => {
    return filteredProjects.slice(0, 2);
  }, [filteredProjects]);

  return (
    <section id="project" className="projects-section-container">
      <h2 className="section-title">
        <i className="fas fa-laptop-code" style={{ color: 'var(--accent)' }}></i> Projects
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Projects...</p>}
      {!loading && featuredProjects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}

      <div className="projects-list-wrapper">
        {featuredProjects.map((p, i) => (
          <ProjectRow key={p.id || i} project={p} index={i} />
        ))}
      </div>

      {!loading && filteredProjects.length > 2 && (
        <div className="view-all-projects-footer">
          <button onClick={onViewAll} className="view-all-projects-link">
            View All Projects <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}
    </section>
  );
}
