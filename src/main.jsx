import { StrictMode, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
const Journey = lazy(() => import('./journey/JourneyApp.jsx'));
const Classic = lazy(() => import('./ClassicApp.jsx'));
const exploring = /^\/journey(?:\/|$)/.test(window.location.pathname);
ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div style={{position:'fixed',inset:0,display:'grid',placeItems:'center',background:'#eee9dd',color:'#4c5146',fontFamily:'Georgia,serif'}}>Kaius’s Journey · 旅途正在展开…</div>}>
      {exploring ? <Journey /> : <Classic />}
    </Suspense>
  </StrictMode>,
);
