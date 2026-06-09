import { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import AllProjects from './components/sections/AllProjects';
import Skills from './components/sections/Skills';
import Experience from './components/sections/Experience';
import Awards from './components/sections/Awards';
import Contact from './components/sections/Contact';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [currentPage, setCurrentPage] = useState('home');
  const [scrollTarget, setScrollTarget] = useState(null);

  // Handle layout-stable scroll targeting (ResizeObserver prevents page-load race conditions)
  useEffect(() => {
    if (currentPage !== 'home' || !scrollTarget) return;

    const el = document.getElementById(scrollTarget);
    if (!el) return;

    const handleScroll = () => {
      const navbar = document.querySelector('.navbar-container');
      const navbarHeight = navbar ? navbar.offsetHeight : 60;
      const offset = navbarHeight + 32; // Dynamic offset with clean margin

      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'auto'
      });
    };

    // Run initially
    handleScroll();

    // Observe changes in document height/layout to adjust scroll position as sections load
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });

    const contentEl = document.querySelector('.content');
    if (contentEl) {
      resizeObserver.observe(contentEl);
    }

    window.addEventListener('load', handleScroll);

    // Disconnect scroll locking on manual user interaction
    const stopObserver = () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', handleScroll);
      window.removeEventListener('wheel', stopObserver);
      window.removeEventListener('touchmove', stopObserver);
      setScrollTarget(null);
    };

    window.addEventListener('wheel', stopObserver, { passive: true });
    window.addEventListener('touchmove', stopObserver, { passive: true });

    // Safety timeout to release observer lock after 1.5 seconds
    const timeout = setTimeout(stopObserver, 1500);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', handleScroll);
      window.removeEventListener('wheel', stopObserver);
      window.removeEventListener('touchmove', stopObserver);
      clearTimeout(timeout);
    };
  }, [currentPage, scrollTarget]);



  useEffect(() => {
    if (currentPage !== 'home') return;

    const sectionIds = ['hero', 'about', 'skills', 'project', 'experience', 'awards', 'contact'];

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -50% 0px', // Trigger when section enters screen center
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, [currentPage]);

  return (
    <div id="main-portfolio">
      {currentPage === 'home' ? (
        <>
          <NavBar activeSection={activeSection} />

          <main className="content">
            <Hero />
            <About />
            <Skills />
            <Projects onViewAll={() => {
              const originalScrollBehavior = document.documentElement.style.scrollBehavior;
              document.documentElement.style.scrollBehavior = 'auto';
              setCurrentPage('all-projects');
              window.scrollTo(0, 0);
              // Force layout reflow
              document.documentElement.offsetHeight;
              document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }} />
            <Experience />
            <Awards />
            <Contact />
          </main>
        </>
      ) : (
        <AllProjects onBack={() => {
          setCurrentPage('home');
          setScrollTarget('project');
        }} />
      )}

      <footer className="site-footer">
        <p>© 2026 Kaius Jin. Built at Waterloo.</p>
      </footer>
    </div>
  );
}

export default App;
