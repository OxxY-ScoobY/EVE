import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/eve-theme.css';
import './styles/animations.css';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
