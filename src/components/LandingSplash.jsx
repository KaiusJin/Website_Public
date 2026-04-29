import React, { useState, useEffect } from 'react';

export default function LandingSplash({ onExplore, isFading }) {
    const greetings = ["Ciallo～(∠・ω< )⌒☆", "Hello", "你好", "Bonjour", "Hola", "こんにちは", "안녕하세요", "Ciao", "Привет"];
    const [greetingIndex, setGreetingIndex] = useState(0);
    const [greetingFade, setGreetingFade] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setGreetingFade("greeting-fade");
            setTimeout(() => {
                setGreetingIndex((prev) => (prev + 1) % greetings.length);
                setGreetingFade("");
            }, 400);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div id="landing-splash" className={isFading ? 'fade-out' : ''} style={isFading ? { display: 'flex' } : {}}>
            <div className="landing-content">
                <h1 style={{ margin: 0, paddingBottom: '20px', textAlign: 'center' }}>
                    <div id="dynamic-greeting" className={`greeting-text ${greetingFade}`} style={{ marginBottom: '15px' }}>
                        {greetings[greetingIndex]}
                    </div>
                    <div>I'm Kaius Jin</div>
                </h1>
                <p className="landing-warning-box">
                    <strong>Hey! Welcome.</strong> To provide more targeted and in-depth technical details for certain projects, some of my specific experiences are hidden behind a dedicated link. If you're a recruiter or hiring manager, please make sure to click the link directly attached to my resume to unlock all the contents!
                </p>
                
                <div className="landing-options" style={{ justifyContent: 'center', marginTop: '30px' }}>
                    <button className="explore-btn" onClick={onExplore} aria-label="Explore My Portfolio">
                        <i className="fas fa-rocket"></i>
                        <span>Explore My Portfolio</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
