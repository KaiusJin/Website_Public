import { useCMSData } from "../../hooks/useCMSData";
import ProjectRow from "./ProjectRow";
import { featuredPreviews } from "../../data/projectPresentation";

export default function Projects() {
  const { data: projects, loading, error } = useCMSData("projects");
  return (
    <section
      id="project"
      className="work-section"
      aria-labelledby="work-heading"
    >
      <div className="section-heading">
        <h2 id="work-heading" tabIndex="-1">
          Projects
        </h2>
      </div>
      {loading && (
        <p className="loading-message" role="status">
          Loading projects…
        </p>
      )}
      {error && <p role="alert">Projects could not be loaded.</p>}
      {!loading && !error && projects.length === 0 && (
        <p>No projects to show yet.</p>
      )}
      <div className="projects-list-wrapper">
        {projects.slice(0, featuredPreviews.length).map((project, index) => (
          <ProjectRow key={project.id} project={project} previewType={featuredPreviews[index]} />
        ))}
      </div>
      {!loading && !error && projects.length > featuredPreviews.length && (
        <div className="archive-invitation">
          <a href="/projects" className="text-link">
            All projects{" "}
            <span className="archive-count">{projects.length}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </section>
  );
}
