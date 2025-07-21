import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx: Starting application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Root element found, creating root...');
  
  try {
    const root = createRoot(rootElement);
    console.log('main.tsx: Rendering App component...');
    
    root.render(
      <StrictMode>
        <div className="debug-container">
          <p>Application is loading...</p>
          <App />
        </div>
      </StrictMode>
    );
    
    console.log('main.tsx: App component rendered');
  } catch (error) {
    console.error('main.tsx: Error rendering app:', error);
    rootElement.innerHTML = `
      <div style="color: red; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Erreur de chargement de l'application</h2>
        <p>${error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}</p>
        <pre>${JSON.stringify(error, null, 2)}</pre>
      </div>
    `;
  }
}
