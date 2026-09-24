import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { reloadForNewVersion } from '@/lib/appVersion';

// A file of an older deployment failed to preload: reload once to get the new version.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Failed to mount React application');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
