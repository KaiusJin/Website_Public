import { useState, useEffect, useRef } from "react";
import NavBar from "./components/NavBar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Projects from "./components/sections/Projects";
import AllProjects from "./components/sections/AllProjects";
import Experience from "./components/sections/Experience";
import Contact from "./components/sections/Contact";
import { useCMSData } from "./hooks/useCMSData";
import { resolveProfile } from "./data/profile";

export default function App() {
  const profileContent = useCMSData("site_profile");
  const profile =
    profileContent.loading || profileContent.error
      ? {}
      : (resolveProfile(profileContent.data) ?? {});
  const [activeSection, setActiveSection] = useState("hero");
  const isArchive = typeof window !== "undefined" && /^\/projects\/?$/.test(window.location.pathname);
  const navigating = useRef(false);

  useEffect(() => {
    if (isArchive) return;
    const sections = ["hero", "about", "experience", "project", "contact"]
      .map((id) => document.getElementById(id)).filter(Boolean);
    const updateActiveSection = () => {
      if (navigating.current) return;
      const atBottom = window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const current = atBottom ? sections.at(-1) :
        sections.findLast((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.3);
      setActiveSection(current?.id || "hero");
    };
    const releaseNavigation = () => { navigating.current = false; };
    const releaseEvents = ["scrollend", "wheel", "pointerdown", "keydown"];
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    releaseEvents.forEach((event) => window.addEventListener(event, releaseNavigation, { passive: true }));
    return () => {
      releaseNavigation();
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      releaseEvents.forEach((event) => window.removeEventListener(event, releaseNavigation));
    };
  }, [isArchive]);
  return (
    <div id="main-portfolio">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!isArchive ? (
        <>
          <NavBar activeSection={activeSection} onNavigate={(id) => {
            navigating.current = true;
            setActiveSection(id);
          }} />
          <main className="content" id="main-content">
            <Hero
              profile={profile}
              loading={profileContent.loading}
              error={profileContent.error}
            />
            <About
              profile={profile}
              loading={profileContent.loading}
              error={profileContent.error}
            />
            <Experience />
            <Projects />
            <Contact
              profile={profile}
              loading={profileContent.loading}
              error={profileContent.error}
            />
          </main>
        </>
      ) : (
        <AllProjects />
      )}
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Kaius Jin</span>
        <div className="webring-widget">
          <a href="https://cs.uwatering.com/#https://kaiusjin.com?nav=prev" aria-label="Previous Waterloo CS Webring site">←</a>
          <a
            href="https://cs.uwatering.com/#https://kaiusjin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="https://cs.uwatering.com/icon.black.svg" alt="Waterloo CS Webring" width="24" />
          </a>
          <a href="https://cs.uwatering.com/#https://kaiusjin.com?nav=next" aria-label="Next Waterloo CS Webring site">→</a>
        </div>
      </footer>
    </div>
  );
}
