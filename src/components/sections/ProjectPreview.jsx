import { useState } from "react";

const discussionSections = ["All Discussions", "Academic", "Find Roommate", "Carpool"];
const jobs = [
  {
    title: "Software Developer Intern",
    company: "Northstar Labs",
    location: "Toronto, ON",
    tags: ["React", "TypeScript"],
    description: "Build thoughtful interfaces for tools people use every day.",
    skills: ["React", "TypeScript"],
    missing: "GraphQL",
  },
  {
    title: "Backend Developer Co-op",
    company: "Cedar Systems",
    location: "Waterloo, ON",
    tags: ["Python", "PostgreSQL"],
    description:
      "Connect reliable APIs, useful data, and the teams that depend on them.",
    skills: ["Python", "PostgreSQL"],
    missing: "Kubernetes",
  },
  {
    title: "Machine Learning Intern",
    company: "Fieldnote",
    location: "Remote, Canada",
    tags: ["Python", "PyTorch"],
    description:
      "Turn messy information into experiments you can measure and explain.",
    skills: ["Python"],
    missing: "PyTorch",
  },
];

function PreviewSurface({ name, children }) {
  return (
    <div className="mini-window">
      <div className="mini-app" aria-label={`${name} interactive preview`}>
        {children}
      </div>
    </div>
  );
}

function DegreePreview() {
  const [section, setSection] = useState("All Discussions");
  return (
    <PreviewSurface name="UW Degree Explorer">
      <div className="mini-degree-heading">
        <span className="mini-brand">
          <span className="degree-mark" aria-hidden="true">DE<span>◆</span></span>
          UW Degree Explorer
        </span>
        <a className="degree-community-link" href="https://uwdegree.org/" target="_blank" rel="noopener noreferrer">
          Join community <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="mini-degree-layout">
        <div className="degree-sidebar" role="group" aria-label="Preview discussion sections">
          {discussionSections.map((name) => (
            <button key={name} type="button" aria-pressed={section === name} onClick={() => setSection(name)}>
              <span aria-hidden="true">{name === "All Discussions" ? "⌂" : name === "Academic" ? "◇" : name === "Find Roommate" ? "⌑" : "↔"}</span>
              {name}
            </button>
          ))}
          <a className="degree-course-link" href="https://uwdegree.org/" target="_blank" rel="noopener noreferrer">
            Course Explorer <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="degree-community">
          <h4 aria-live="polite">{section}</h4>
          <div className="degree-welcome">
            <span className="degree-mark degree-welcome-mark" aria-hidden="true">DE<span>◆</span></span>
            <h5>Welcome to<br />UW Degree Explorer</h5>
            <p>Plan your courses.<br />Find your community.</p>
            <a href="https://uwdegree.org/" target="_blank" rel="noopener noreferrer">
              Explore <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </PreviewSurface>
  );
}

function InternPreview() {
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState([]);
  const job = jobs[selected];
  const isSaved = saved.includes(selected);
  return (
    <PreviewSurface name="WeCanFindIntern">
      <div className="mini-intern-heading">
        <span className="mini-brand">
          <span className="intern-mark" aria-hidden="true">
            ↗
          </span>
          WeCanFindIntern
        </span>
      </div>
      <div className="mini-jobs-toolbar">
        <div>
          <h4>Internships</h4>
        </div>
        <span className="mini-saved-count" aria-live="polite">
          {saved.length} saved
        </span>
      </div>
      <div className="mini-jobs-layout">
        <div
          className="mini-job-list"
          role="group"
          aria-label="Select a sample job"
        >
          {jobs.map((item, index) => (
            <button
              key={item.company}
              className="mini-job"
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
            >
              <span className={`company-monogram company-${index}`}>
                {item.company[0]}
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className="job-company">
                  {item.company} · {item.location}
                </span>
                <span className="mini-job-tags">{item.tags.join(" · ")}</span>
              </span>
              <span
                className="saved-dot"
                aria-label={saved.includes(index) ? "Saved" : undefined}
              >
                {saved.includes(index) ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
        <div className="mini-job-detail">
          <span className="mini-eyebrow">Job match</span>
          <h5>{job.title}</h5>
          <p>{job.description}</p>
          <div className="match-evidence">
            <span className="match-label">✓ {`${job.skills.length} shared skill${job.skills.length === 1 ? "" : "s"}`}</span>
            <span>{job.skills.join(" / ")}</span>
            <span className="gap-label">To explore</span>
            <span>{job.missing}</span>
          </div>
          <button
            className={`mini-save-button ${isSaved ? "is-saved" : ""}`}
            aria-pressed={isSaved}
            onClick={() =>
              setSaved((previous) =>
                isSaved
                  ? previous.filter((index) => index !== selected)
                  : [...previous, selected],
              )
            }
          >
            {isSaved ? "Saved to shortlist ✓" : "Save to shortlist +"}
            <span className="sr-only"> {job.title}</span>
          </button>
        </div>
      </div>
    </PreviewSurface>
  );
}

export default function ProjectPreview({ type }) {
  return type === "degree" ? <DegreePreview /> : <InternPreview />;
}
