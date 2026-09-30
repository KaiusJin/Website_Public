import { useCMSData } from "../../hooks/useCMSData";
import ProjectRow from "./ProjectRow";
import { featuredPreviews } from "../../data/projectPresentation";

export default function AllProjects() {
  const { data: projects, loading, error } = useCMSData("projects");
  return (
    <div className="all-projects-page">
      <header className="site-header">
        <nav
          className="navbar-container"
          aria-label="Project archive navigation"
        >
          <a className="navbar-logo" href="/">
            Kaius Jin<span className="logo-period">.</span>
          </a>
          <a className="text-link" href="/#project">
            <span aria-hidden="true">←</span> Back to home
          </a>
        </nav>
      </header>
      <main className="content" id="main-content">
        <div className="archive-header">
          <h1>
            Projects
          </h1>
        </div>
        {loading && <p role="status">Loading projects…</p>}
        {error && <p role="alert">Projects could not be loaded.</p>}
        {!loading && !error && !projects.length && (
          <p>No projects to show yet.</p>
        )}
        <div className="projects-list-wrapper">
          {projects.map((project, index) => (
            <ProjectRow key={project.id} project={project} previewType={featuredPreviews[index]} />
          ))}
        </div>
        <div className="archive-footer">
          <a className="text-link" href="/#project">
            <span aria-hidden="true">←</span> Back to home
          </a>
        </div>
      </main>
    </div>
  );
}
