import { useEffect } from 'react';
import { useCMSData } from '../../hooks/useCMSData';
import ProjectRow from './ProjectRow';

export default function AllProjects({ onBack }) {
  const { data: projectsData, loading, error } = useCMSData('projects');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="all-projects-page">
      {/* Floating Subpage Navbar */}
      <header className="navbar-container all-projects-navbar" role="navigation" aria-label="Archive Navigation">
        <div className="navbar-content">
          <button type="button" className="navbar-logo navbar-logo-button" onClick={onBack}>
            Kaius <span>Jin</span>
          </button>
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
        {!loading && error && <p role="alert" style={{ color: 'var(--text-secondary)' }}>Projects could not be loaded.</p>}
        {!loading && !error && projectsData.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>}

        <div className="projects-list-wrapper">
          {projectsData.map((p, i) => (
            <ProjectRow key={p.id} project={p} index={i} />
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
