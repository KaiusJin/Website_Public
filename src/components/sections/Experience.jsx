import { useCMSData } from "../../hooks/useCMSData";
import { dateRange } from "../../data/profile";
import { safeUrl } from "../../data/content";

function ExperienceRow({ item }) {
  const website = safeUrl(item.link);
  return (
    <article className="experience-row">
      <p className="experience-date">{dateRange(item)}</p>
      <div className="experience-role">
        <h4>
          {website ? (
            <a
              className="timeline-title-link"
              href={website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.title} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            item.title
          )}
        </h4>
        <p>
          <i className={item.role_icon} aria-hidden="true" />
          {item.role}
        </p>
      </div>
      <div className="experience-detail">
        {item.bullets?.length > 0 && (
          <ul>
            {item.bullets.map((bullet, i) => (
              <li key={i}>{bullet.text}</li>
            ))}
          </ul>
        )}
        {item.skills?.length > 0 && (
          <p className="experience-skills">
            {item.skills.map((skill) => skill.tag).join(" / ")}
          </p>
        )}
      </div>
    </article>
  );
}

export default function Experience() {
  const work = useCMSData("work_experiences");
  const clubs = useCMSData("club_experiences");
  const volunteering = useCMSData("volunteer_experiences");
  const groups = [
    ["Work Experience", work],
    ["Clubs & Design Teams", clubs],
    ["Volunteer Experience", volunteering],
  ];
  return (
    <section
      id="experience"
      className="experience-section"
      aria-labelledby="experience-title"
    >
      <div className="section-heading">
        <h2 id="experience-title">Experience</h2>
      </div>
      {groups.map(([label, content], index) => {
        const rows = (
          <>
            {content.loading && <p role="status">Loading experience…</p>}
            {content.error && <p role="alert">{label} could not be loaded.</p>}
            {!content.loading && !content.error && !content.data.length && (
              <p>No experience to show yet.</p>
            )}
            {content.data.map((item) => (
              <ExperienceRow key={item.id} item={item} />
            ))}
          </>
        );
        return index === 0 ? (
          <div className="experience-group" key={label}>
            <h3 className="sr-only">{label}</h3>
            {rows}
          </div>
        ) : (
          <details
            className="experience-group experience-disclosure"
            key={label}
          >
            <summary>
              {label}
              <span className="disclosure-right">
                <span className="item-count">{content.data.length}</span>
                <span aria-hidden="true">+</span>
              </span>
            </summary>
            {rows}
          </details>
        );
      })}
    </section>
  );
}
