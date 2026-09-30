import { useCMSData } from '../../hooks/useCMSData';
import { safeUrl } from '../../data/content';

export default function Awards() {
  const { data, loading, error } = useCMSData('awards');
  return (
    <div id="awards" className="awards-index">
      {loading && <p role="status">Loading recognition…</p>}
      {error && <p role="alert">Awards could not be loaded.</p>}
      {!loading && !error && !data.length && <p>No awards to show yet.</p>}
      {data.map((award) => (
        <div className="award-row" key={award.id}>
          <span className="award-year">{award.year}</span>
          <div>
            <div className="award-heading">
              <h3>{award.title}</h3>
              {award.organization && <span className="award-issuer">{award.organization}</span>}
            </div>
            {safeUrl(award.link) && (
              <a
                href={safeUrl(award.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                View certificate{' '}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
