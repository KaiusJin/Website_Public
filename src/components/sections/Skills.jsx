import { useCMSData } from '../../hooks/useCMSData';

export default function Skills() {
  const { data, loading, error } = useCMSData('skills');
  return (
    <div id="skills" className="skills-index">
      {loading && <p role="status">Loading skills…</p>}
      {error && <p role="alert">Skills could not be loaded.</p>}
      {!loading && !error && !data.length && <p>No skills to show yet.</p>}
      {data.map((category) => (
        <div className="skill-row" key={category.id}>
          <h3>
            <i className={category.category_icon} aria-hidden="true" />
            {category.category}
          </h3>
          <p>{(category.skills || []).map((skill) => skill.tag).join(' / ')}</p>
        </div>
      ))}
    </div>
  );
}
