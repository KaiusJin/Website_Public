import React from 'react';

export default function NavBar({ activePage, setActivePage }) {
    const handleNav = (page) => {
        setActivePage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav role="navigation" aria-label="Main Navigation">
            <a role="button" tabIndex="0" className={activePage === 'about' ? 'active' : ''} onClick={() => handleNav('about')}>About Me</a>
            <a role="button" tabIndex="0" className={activePage === 'project' ? 'active' : ''} onClick={() => handleNav('project')}>Project</a>
            <a role="button" tabIndex="0" className={activePage === 'experience' ? 'active' : ''} onClick={() => handleNav('experience')}>Experience</a>
            <a role="button" tabIndex="0" className={activePage === 'awards' ? 'active' : ''} onClick={() => handleNav('awards')}>Awards & Certifications</a>
            <a role="button" tabIndex="0" className={activePage === 'contact' ? 'active' : ''} onClick={() => handleNav('contact')}>Contact</a>
        </nav>
    );
}
