import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./App.tsx";
import { ResetPassword } from "./components/ResetPassword.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  </BrowserRouter>
);

// Register service worker for PWA support with update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update();
        }, 60000);
        
                // Listen for new service worker waiting
        registration.addEventListener('updatefound', () => {
          console.log('🔄 UPDATE FOUND EVENT FIRED!');
          const newWorker = registration.installing;
          console.log('📦 New worker:', newWorker);
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('🔄 Worker state changed:', newWorker.state);
              console.log('🔄 Has controller?', !!navigator.serviceWorker.controller);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✅ DISPATCHING swUpdateAvailable EVENT');
                window.dispatchEvent(new CustomEvent('swUpdateAvailable', { detail: registration }));
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}