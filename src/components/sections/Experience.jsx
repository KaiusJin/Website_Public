import { useCMSData } from '../../hooks/useCMSData';
import { dateRange } from '../../data/profile';

export default function Experience() {
  const { data: workExperiences, loading: workLoading, error: workError } = useCMSData('work_experiences');
  const { data: clubExperiences, loading: clubLoading, error: clubError } = useCMSData('club_experiences');
  const { data: volunteerExperiences, loading: volunteerLoading, error: volunteerError } = useCMSData('volunteer_experiences');
  const experiencesLoading = workLoading || clubLoading || volunteerLoading;
  const experiencesError = workError || clubError || volunteerError;
  const experiences = [
    ...workExperiences.map(item => ({ ...item, category: 'Work Experience' })),
    ...clubExperiences.map(item => ({ ...item, category: 'Clubs & Design Teams' })),
    ...volunteerExperiences.map(item => ({ ...item, category: 'Volunteer Experience' })),
  ];

  return (
    <section id="experience">
      <h2 className="section-title">
        <i className="fas fa-briefcase" style={{ color: 'var(--accent)' }}></i> Experience
      </h2>

      {experiencesLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading Experiences...</p>}
      {!experiencesLoading && experiencesError && <p role="alert" style={{ color: 'var(--text-secondary)' }}>Experience could not be loaded.</p>}
      {!experiencesLoading && !experiencesError && experiences.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No experiences yet.</p>
      )}

      <div className="timeline-container">
        {experiences.map((e) => (
          <div key={`${e.category}-${e.id}`} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-title-area">
                  <p className="experience-category">{e.category}</p>
                  <h3>{e.title}</h3>
                  <h4>
                    <i className={e.role_icon} aria-hidden="true"></i>
                    {e.role}
                  </h4>
                </div>
                <span className="timeline-date">{dateRange(e)}</span>
              </div>

              <div className="timeline-body">
                <ul className="timeline-bullets">
                  {(e.bullets || []).map((b, j) => (
                    <li key={j}>{b.text}</li>
                  ))}
                </ul>
                {e.skills?.length > 0 && (
                  <div className="skills-list" aria-label={`${e.title} skills`}>
                    {e.skills.map((skill, j) => (
                      <span key={`${skill.tag}-${j}`} className="skill-tag">{skill.tag}</span>
                    ))}
                  </div>
                )}
                {e.link && (
                  <div className="timeline-actions">
                    <a href={e.link} target="_blank" rel="noopener noreferrer">
                      {e.link_text || 'Visit Official Website'} <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem' }}></i>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
