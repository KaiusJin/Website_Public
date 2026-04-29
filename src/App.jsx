import { useState } from 'react';
import NavBar from './components/NavBar';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Awards from './components/sections/Awards';
import Contact from './components/sections/Contact';

function App() {
  const [activeSection, setActiveSection] = useState('about');

  return (
    <>
      <div className="glass fade-in" id="main-portfolio" style={{ display: 'flex', flexDirection: 'column', opacity: 1 }}>
        <div className="top-blur-mask"></div>
        <NavBar activePage={activeSection} setActivePage={setActiveSection} />
        
        <main className="content">
          <About isActive={activeSection === 'about'} />
          <Projects isActive={activeSection === 'project'} />
          <Experience isActive={activeSection === 'experience'} />
          <Awards isActive={activeSection === 'awards'} />
          <Contact isActive={activeSection === 'contact'} />
        </main>
      </div>
      
      <footer>
        <p>&copy; 2026 Kaius Jin. Built with ❤️ at Waterloo.</p>
      </footer>
    </>
  );
}

export default App;
