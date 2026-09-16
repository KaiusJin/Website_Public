import { StrictMode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './scrollbars.css';
const Journey = lazy(() => import('./journey/JourneyApp.jsx'));
const Classic = lazy(() => import('./ClassicApp.jsx'));
const exploring = /^\/journey(?:\/|$)/.test(window.location.pathname);
const fallbackStyle = {
  position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
  background: exploring ? '#eee9dd' : '#f8fafc',
  color: exploring ? '#4c5146' : '#0f172a',
  fontFamily: exploring ? 'Georgia, serif' : 'Inter, sans-serif',
};
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div role="status" data-entry={exploring ? 'journey' : 'classic'} style={fallbackStyle}>{exploring ? 'Loading Kaius’s Journey…' : 'Loading portfolio…'}</div>}>
      {exploring ? <Journey /> : <Classic />}
    </Suspense>
  </StrictMode>,
);
