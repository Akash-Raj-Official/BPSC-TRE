import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initialiseTheme } from '@/store/themeStore';
import { initialiseUiLanguage } from '@/store/uiLanguageStore';
import { runDevValidation } from '@/utils/devValidation';
import './index.css';

// Applies the stored light/dark preference before the first paint.
initialiseTheme();
initialiseUiLanguage();

// Validates the question bank in development only; stripped from production.
if (import.meta.env.DEV) {
  runDevValidation();
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
