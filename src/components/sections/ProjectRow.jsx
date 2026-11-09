import ProjectPreview from "./ProjectPreview";
import { dateRange } from "../../data/profile";
import { safeUrl } from "../../data/content";

export default function ProjectRow({ project, previewType }) {
  const website = safeUrl(project.link);
  const github = safeUrl(project.github_link);
  const date = dateRange(project);
  const bullets = project.bullets || [];
  const summary = bullets[0]?.text;
  const details = bullets.slice(1).filter((bullet) => bullet.text);
  const interactive = Boolean(previewType);

  return (
    <article className={`project-row-item${interactive ? "" : " project-row-text"}`}>
      <div className="project-details-side">
        <h3 className="project-title">
          {website || github ? (
            <a
              href={website || github}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.title}
            </a>
          ) : (
            project.title
          )}
        </h3>
        {date && (
          <p className="project-date">{date}</p>
        )}
        {summary && <p className="project-summary">{summary}</p>}
        {details.length > 0 && (
          <ul className="project-highlights">
            {details.map((bullet, i) => (
              <li key={i}>{bullet.text.replace(/\bGithub\b/g, "GitHub")}</li>
            ))}
          </ul>
        )}
        <div className="project-tags" aria-label="Technologies">
          {(project.skills || []).map((skill, i) => (
            <span key={i}>
              {skill.tag === "Typesctipt" ? "TypeScript" : skill.tag}
            </span>
          ))}
        </div>
        <div className="project-links">
          {website && (
            <a
              className="text-link"
              href={website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {project.link_text || "Visit project"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          )}
          {github && (
            <a
              className="muted-link"
              href={github}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source code <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
      {interactive && (
        <figure className="project-visual-side">
          <ProjectPreview type={previewType} />
        </figure>
      )}
    </article>
  );
}
