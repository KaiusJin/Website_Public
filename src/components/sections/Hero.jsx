import { safeUrl } from "../../data/content";

export default function Hero({ profile, loading, error }) {
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-title">
      <div className="hero-layout">
        <div className="hero-identity">
          {loading ? (
            <div className="name-skeleton" aria-hidden="true" />
          ) : (
            profile.name && (
              <h1 id="hero-title">
                {profile.name}
                <span className="name-period" aria-hidden="true">
                  .
                </span>
              </h1>
            )
          )}
          {profile.hero_badge && (
            <p className="hero-discipline">{profile.hero_badge}</p>
          )}
        </div>
        <div className="hero-introduction">
          {loading && <p role="status">Loading profile…</p>}
          {error && <p role="alert">Profile could not be loaded.</p>}
          {profile.intro && <p className="hero-intro">{profile.intro}</p>}
          <div className="hero-links">
            <a href="#project" className="text-link">
              View projects <span aria-hidden="true">↓</span>
            </a>
            {safeUrl(profile.github) && (
              <a
                href={safeUrl(profile.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="muted-link"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
