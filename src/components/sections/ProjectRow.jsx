import { useState } from 'react';
import { dateRange } from '../../data/profile';

const fallbackImage = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80";

export default function ProjectRow({ project: p, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = p.image_url || fallbackImage;
  const isEven = index % 2 === 0;

  // Use the first bullet as the primary description text
  const primaryDescription = p.bullets && p.bullets[0] ? p.bullets[0].text : '';
  const remainingBullets = p.bullets ? p.bullets.slice(1) : [];

  return (
    <div className={`project-row-item ${isEven ? 'row-normal' : 'row-reversed'}`}>
      {/* Visual Image Side */}
      <div className="project-visual-side">
        <div className="project-image-card">
          <img src={imageUrl} alt={p.image_alt || p.title} loading="lazy" />
        </div>
      </div>

      {/* Description & Details Side */}
      <div className="project-details-side">
        <span className="project-label">Featured Project</span>
        <h3 className="project-title">{p.title}</h3>
        {dateRange(p) && <p className="project-date">{dateRange(p)}</p>}
        
        <div className="project-description-box">
          <p className="project-summary">{primaryDescription}</p>
          
          {remainingBullets.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="btn-read-more"
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show Less Details' : 'Read More Detail'}
              <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginLeft: '6px' }}></i>
            </button>
          )}

          {/* Collapsible bullet points */}
          <div className={`collapsible-bullets-wrapper ${isExpanded ? 'expanded' : ''}`}>
            <ul className="project-bullet-list">
              {remainingBullets.map((b, idx) => (
                <li key={idx} style={{ '--bullet-delay': `${idx * 55}ms` }}>{b.text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Badges */}
        <div className="project-tags">
          {(p.skills || []).map((s, idx) => (
            <span key={idx} className="project-tag-badge">{s.tag}</span>
          ))}
        </div>

        {/* Action Links */}
        <div className="project-links">
          {p.github_link && (
            <a href={p.github_link} target="_blank" rel="noopener noreferrer" className="project-link-btn" title="View Source Code">
              <i className="fab fa-github"></i> Source Code
            </a>
          )}
          {p.link && (
            <a href={p.link} target="_blank" rel="noopener noreferrer" className="project-link-btn" style={{ marginLeft: '16px' }} title="Visit Demo">
              <i className="fas fa-external-link-alt"></i> {p.link_text || 'Live Demo'}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
