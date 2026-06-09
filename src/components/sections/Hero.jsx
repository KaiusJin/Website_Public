import React, { useState, useEffect } from 'react';

export default function Hero() {
  const greetings = [
    { prefix: "Hi, I'm ", suffix: "." },             // English
    { prefix: "你好，我是 ", suffix: "。" },          // Chinese
    { prefix: "Bonjour, je suis ", suffix: "." },    // French
    { prefix: "こんにちは、", suffix: " です。" },   // Japanese
    { prefix: "안녕하세요, ", suffix: " 입니다." }   // Korean
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        setIsFading(false);
      }, 500); // Wait for fade-out to complete before changing text
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 92;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const currentGreeting = greetings[currentIndex];

  return (
    <section id="hero" className="hero-section">
      <div className="hero-glow"></div>
      
      <div className="hero-badge">
        <i className="fas fa-graduation-cap"></i>
        <span>Computer Science @ UWaterloo</span>
      </div>
      
      <h1 
        className="hero-title"
        style={{ 
          transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
          opacity: isFading ? 0 : 1,
          whiteSpace: 'nowrap'
        }}
      >
        {currentGreeting.prefix}<span>Kaius Jin</span>{currentGreeting.suffix}
      </h1>
      
      <p className="hero-subtitle">
        I build clean software systems with clarity, reliability, and thoughtful design. Focus on backend systems, cloud tools, and AI-powered applications.
      </p>
      
      <div className="hero-tags">
        <span>Backend Engineering</span>
        <span>Cloud Infrastructure</span>
        <span>Full-stack Development</span>
        <span>AI Tools</span>
      </div>
      
      <div className="hero-actions">
        <button 
          onClick={() => handleScrollTo('project')} 
          className="btn btn-primary"
        >
          View Projects <i className="fas fa-arrow-right"></i>
        </button>
        <button 
          onClick={() => handleScrollTo('contact')} 
          className="btn btn-secondary"
        >
          Contact Me
        </button>
      </div>

      <div className="hero-scroll-indicator" onClick={() => handleScrollTo('about')}>
        <span>scroll to see more</span>
        <i className="fas fa-chevron-down"></i>
      </div>
    </section>
  );
}
