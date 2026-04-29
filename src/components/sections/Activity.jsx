import React, { useEffect, useRef } from 'react';

export default function Activity({ isActive }) {
    const leetcodeMockRef = useRef(null);

    useEffect(() => {
        if (!isActive || !leetcodeMockRef.current) return;
        const leetcodeMock = leetcodeMockRef.current;
        
        const updateLeetCodeRing = () => {
            const easy = parseInt(leetcodeMock.querySelector('.lc-easy-num').childNodes[0].nodeValue) || 0;
            const med = parseInt(leetcodeMock.querySelector('.lc-med-num').childNodes[0].nodeValue) || 0;
            const hard = parseInt(leetcodeMock.querySelector('.lc-hard-num').childNodes[0].nodeValue) || 0;

            const totalSolved = easy + med + hard;
            const bigSpan = leetcodeMock.querySelector('.lc-big');
            if (bigSpan) bigSpan.textContent = totalSolved;

            const total = 3874;

            const pctEasy = (easy / total) * 100;
            const pctMed = pctEasy + ((med / total) * 100);
            const pctHard = pctMed + ((hard / total) * 100);

            const circle = leetcodeMock.querySelector('.lc-circle');
            if (circle) {
                circle.style.background = `conic-gradient(
                    #2cbb5d 0% ${pctEasy.toFixed(2)}%,      
                    #ffc01e ${pctEasy.toFixed(2)}% ${pctMed.toFixed(2)}%,     
                    #ef4743 ${pctMed.toFixed(2)}% ${pctHard.toFixed(2)}%,     
                    #f0ece4 ${pctHard.toFixed(2)}% 100%     
                )`;
            }
        };

        updateLeetCodeRing();
    }, [isActive]);

    return (
        <section id="activity" className={isActive ? 'active' : ''}>
            <h1 className="gradient-text">Hackathons & Activities</h1>
            <div className="activity-layout">
                <div className="activity-left">
                    <div className="timeline-container">
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-laptop-code"></i></div>
                            <div className="timeline-content">
                                <h3>Hack GT 12</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-terminal"></i></div>
                            <div className="timeline-content">
                                <h3>Hack The Valley</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-robot"></i></div>
                            <div className="timeline-content">
                                <h3>UTRA Hacks 2026</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-microchip"></i></div>
                            <div className="timeline-content">
                                <h3>Ctrl Del Hacks</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-code-branch"></i></div>
                            <div className="timeline-content">
                                <h3>Make UofT</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot"><i className="fas fa-brain"></i></div>
                            <div className="timeline-content">
                                <h3>GenAI Genesis 2026</h3>
                                <p>Hacker / Participant</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="activity-right">
                    <div className="github-card">
                        <h3><i className="fab fa-github"></i> GitHub Contributions</h3>
                        <p className="github-desc">A visual footprint of my open-source activities and project commits.</p>
                        <div className="github-chart-container">
                            <img src="https://ghchart.rshah.org/e76f51/KaiusJin" alt="Kaius Jin's GitHub Chart" />
                        </div>
                    </div>

                    <div className="github-card" style={{ marginTop: '30px' }}>
                        <h3><i className="fas fa-terminal"></i> LeetCode Stats</h3>
                        <p className="github-desc">Algorithmic problem solving records.</p>
                        <div className="leetcode-chart-container">
                            <div className="leetcode-mock" ref={leetcodeMockRef}>
                                <div className="lc-circle">
                                    <div className="lc-inner">
                                        <div className="lc-count">
                                            <span className="lc-big">133</span>
                                            <span className="lc-small">/3874</span>
                                        </div>
                                        <div className="lc-solved">Solved</div>
                                    </div>
                                </div>
                                <div className="lc-stats">
                                    <div className="lc-stat-box">
                                        <span className="lc-easy">Easy</span>
                                        <span className="lc-num lc-easy-num">103<span className="lc-tot">/932</span></span>
                                    </div>
                                    <div className="lc-stat-box">
                                        <span className="lc-med">Med.</span>
                                        <span className="lc-num lc-med-num">21<span className="lc-tot">/2027</span></span>
                                    </div>
                                    <div className="lc-stat-box">
                                        <span className="lc-hard">Hard</span>
                                        <span className="lc-num lc-hard-num">9<span className="lc-tot">/915</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
