import { useCMSData } from '../../hooks/useCMSData';
import ProjectRow from './ProjectRow';

export default function Projects({ onViewAll }) {
  const { data: projectsData, loading, error } = useCMSData('projects');
  const featuredProjects = projectsData.slice(0, 2);

  return (
    <section id="project" className="projects-section-container">
      <h2 className="section-title">
        <i className="fas fa-laptop-code" style={{ color: 'var(--accent)' }}></i> Projects
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading Projects...</p>}
      {!loading && error && <p role="alert" style={{ color: 'var(--text-secondary)' }}>Projects could not be loaded.</p>}
      {!loading && !error && featuredProjects.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}

      <div className="projects-list-wrapper">
        {featuredProjects.map((p, i) => (
          <ProjectRow key={p.id} project={p} index={i} />
        ))}
      </div>

      {!loading && !error && projectsData.length > 2 && (
        <div className="view-all-projects-footer">
          <button onClick={onViewAll} className="view-all-projects-link">
            View All Projects <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}
    </section>
  );
}
