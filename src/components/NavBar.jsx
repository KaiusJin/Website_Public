import React from 'react';
import { scrollToElementWithOffset } from '../utils/smoothScroll';

export default function NavBar({ activeSection }) {
  const navItems = [
    { label: 'About', id: 'about' },
    { label: 'Skills', id: 'skills' },
    { label: 'Projects', id: 'project' },
    { label: 'Experience', id: 'experience' },
    { label: 'Awards', id: 'awards' },
    { label: 'Contact', id: 'contact' }
  ];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const navbar = document.querySelector('.navbar-container');
    const navbarHeight = navbar ? navbar.offsetHeight : 60;

    scrollToElementWithOffset(id, navbarHeight + 32);
  };

  return (
    <nav className="navbar-container" role="navigation" aria-label="Main Navigation">
      <div className="navbar-content">
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="navbar-logo"
        >
          Kaius <span>Jin</span>
        </a>

        <div className="navbar-links">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? 'active' : ''}
              onClick={(e) => handleNavClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
