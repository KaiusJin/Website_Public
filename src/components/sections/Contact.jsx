import React, { useRef } from 'react';

export default function Contact({ isActive }) {
    const formRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        
        if (window.emailjs && formRef.current) {
            window.emailjs.sendForm('service_id', 'template_id', formRef.current)
                .then(() => alert('Message Sent!'))
                .catch((err) => console.error(err));
        }
    };

    return (
        <section id="contact" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Let's Connect</h1>
            <div className="contact-container">
                <div className="contact-left">
                    <div className="contact-big-item">
                        <i className="fas fa-envelope"></i>
                        <div className="contact-text">
                            <span>Email</span>
                            <a href="mailto:kaius.jin@outlook.com">kaius.jin@outlook.com</a>
                        </div>
                    </div>
                    <div className="contact-big-item">
                        <i className="fab fa-github"></i>
                        <div className="contact-text">
                            <span>GitHub</span>
                            <a href="https://github.com/KaiusJin" target="_blank" rel="noopener noreferrer">github.com/KaiusJin</a>
                        </div>
                    </div>
                    <div className="contact-big-item">
                        <i className="fab fa-linkedin"></i>
                        <div className="contact-text">
                            <span>LinkedIn</span>
                            <a href="https://www.linkedin.com/in/kaixuan-jin/" target="_blank" rel="noopener noreferrer">in/kaixuan-jin</a>
                        </div>
                    </div>
                    <div className="contact-big-item">
                        <i className="fas fa-laptop-code"></i>
                        <div className="contact-text">
                            <span>Devpost</span>
                            <a href="https://devpost.com/kaixuan-jin?ref_content=user-portfolio&ref_feature=portfolio&ref_medium=global-nav" target="_blank" rel="noopener noreferrer">devpost.com/kaixuan-jin</a>
                        </div>
                    </div>
                </div>
                <div className="contact-right">
                    <form id="contact-form" ref={formRef} onSubmit={handleSubmit}>
                        <input type="text" name="from_name" placeholder="Name" required />
                        <input type="email" name="from_email" placeholder="Email" required />
                        <textarea name="message" placeholder="Message" rows="5" required></textarea>
                        <div className="g-recaptcha" data-sitekey="6LdjJNArAAAAAAc9QzBoXlZItuKErs9P2pjqF5Pl"></div>
                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    );
}
