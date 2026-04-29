import { useState, useEffect } from 'react';
import { useCMSData } from './hooks/useCMSData';
import LandingSplash from './components/LandingSplash';
import NavBar from './components/NavBar';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Awards from './components/sections/Awards';
import Activity from './components/sections/Activity';
import Contact from './components/sections/Contact';

function App() {
  const [activeSection, setActiveSection] = useState('about');
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [mainFading, setMainFading] = useState(false);

    useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowSplash(false);
      setMainFading(true);
    }
  }, []);

  const handleExplore = () => {
    localStorage.setItem('hasVisited', 'true');
    setSplashFading(true);
    
    setTimeout(() => {
      setShowSplash(false);
      setSplashFading(false);
      setMainFading(true);
      window.scrollTo(0, 0);
    }, 500);
  };

  const openPreferences = () => {
    setShowSplash(true);
    setMainFading(false);
  };

  return (
    <>
      {showSplash && (
        <LandingSplash onExplore={handleExplore} isFading={splashFading} />
      )}
      
      {!showSplash && (
        <div className={`glass ${mainFading ? 'fade-in' : ''}`} id="main-portfolio" style={{ display: 'flex', flexDirection: 'column', opacity: 1 }}>
          <div className="top-blur-mask"></div>
          <NavBar activePage={activeSection} setActivePage={setActiveSection} openPreferences={openPreferences} />
          
          <main className="content">
            <About isActive={activeSection === 'about'} />
            <Projects isActive={activeSection === 'project'} />
            <Experience isActive={activeSection === 'experience'} />
            <Awards isActive={activeSection === 'awards'} />
            <Activity isActive={activeSection === 'activity'} />
            <Contact isActive={activeSection === 'contact'} />
          </main>
        </div>
      )}
      
      <footer>
        <p>&copy; 2026 Kaius Jin. Built with ❤️ at Waterloo.</p>
      </footer>
    </>
  );
}

export default App;
