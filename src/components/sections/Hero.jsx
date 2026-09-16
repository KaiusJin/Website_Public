import { useState, useEffect } from 'react';
import { scrollToElementWithOffset } from '../../utils/smoothScroll';

const greetings = [
  { prefix: "Hi, I'm ", suffix: "." },
  { prefix: "你好，我是 ", suffix: "。" },
  { prefix: "Bonjour, je suis ", suffix: "." },
  { prefix: "こんにちは、", suffix: " です。" },
  { prefix: "안녕하세요, ", suffix: " 입니다." }
];

export default function Hero({ profile }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let transitionTimeout;
    const interval = setInterval(() => {
      setIsFading(true);
      transitionTimeout = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % greetings.length);
        setIsFading(false);
      }, 500);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, []);

  const handleScrollTo = (id) => {
    scrollToElementWithOffset(id, 92);
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
      
      {profile.intro && <p className="hero-subtitle">{profile.intro}</p>}
      
      <div className="hero-tags">
        <span>Backend Engineering</span>
        <span>Cloud Infrastructure</span>
        <span>Full-stack Development</span>
        <span>AI Tools</span>
      </div>
      
      <div className="hero-actions">
        <a href="/journey" className="btn btn-secondary">Explore my journey <i className="fas fa-moon" /></a>
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
