export default function NavBar({ activeSection, onNavigate }) {
  const selectSection = (event, id) => {
    if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate(id);
  };
  return (
    <header className="site-header">
      <nav className="navbar-container" aria-label="Main navigation">
        <a href="#hero" className="navbar-logo" aria-label="Kaius Jin — home" onClick={(event) => selectSection(event, 'hero')}>
          Kaius Jin<span className="logo-period">.</span>
        </a>
        <div className="navbar-links">
          {[
            ['About', 'about'],
            ['Experience', 'experience'],
            ['Project', 'project'],
            ['Contact', 'contact'],
          ].map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(event) => selectSection(event, id)}
              aria-current={activeSection === id ? 'location' : undefined}
            >
              {label}
            </a>
          ))}
          <a href="/journey">Journey</a>
        </div>
      </nav>
    </header>
  );
}
