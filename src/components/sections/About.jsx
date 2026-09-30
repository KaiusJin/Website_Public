import Skills from "./Skills";
import Awards from "./Awards";

export default function About({ profile, loading, error }) {
  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="section-heading">
        <h2 id="about-title">About</h2>
      </div>
      {loading && <p role="status">Loading profile…</p>}
      {error && <p role="alert">Profile could not be loaded.</p>}
      {!loading && !error && (
        <div className="about-layout">
          <div className="about-bio">{profile.bio && <p>{profile.bio}</p>}</div>
          <dl className="about-facts">
            {[
              ["Based in", profile.location],
              ["Studying", profile.education],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}
      <div className="background-details">
        <details>
          <summary>
            Skills <span aria-hidden="true">+</span>
          </summary>
          <Skills />
        </details>
        <details>
          <summary>
            Awards & certifications <span aria-hidden="true">+</span>
          </summary>
          <Awards />
        </details>
      </div>
    </section>
  );
}
