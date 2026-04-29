import React from 'react';

export default function NavBar({ activePage, setActivePage, openPreferences }) {
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
            {/* <a role="button" tabIndex="0" className={activePage === 'activity' ? 'active' : ''} onClick={() => handleNav('activity')}>Activity</a> */}
            <a role="button" tabIndex="0" className={activePage === 'contact' ? 'active' : ''} onClick={() => handleNav('contact')}>Contact</a>
            <a role="button" tabIndex="0" id="open-preferences" style={{ cursor: 'pointer', marginLeft: '10px', color: '#e76f51' }} onClick={openPreferences}>
                <i className="fas fa-redo"></i> Welcome Screen
            </a>
        </nav>
    );
}
