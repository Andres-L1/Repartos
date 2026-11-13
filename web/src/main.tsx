import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { applyLegacyRedirect } from './router';
import { SessionProvider } from './session';
import './styles.css';
import './shop.css';

applyLegacyRedirect();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>,
);
