import { safeUrl } from "../../data/content";

export default function Contact({ profile, loading, error }) {
  return (
    <section
      id="contact"
      className="contact-section"
      aria-labelledby="contact-title"
    >
      <div className="contact-layout">
        <h2 id="contact-title">Say hello.</h2>
        <div className="contact-details">
          {loading && <p role="status">Loading contact details…</p>}
          {error && <p role="alert">Contact details could not be loaded.</p>}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="contact-email">
              {profile.email}
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <div className="contact-socials">
            {[
              ["GitHub", profile.github],
              ["LinkedIn", profile.linkedin],
            ].map(
              ([label, href]) => {
                const url = safeUrl(href);
                return url && (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label} <span aria-hidden="true">↗</span>
                  </a>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
