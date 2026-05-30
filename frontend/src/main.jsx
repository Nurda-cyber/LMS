import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { queryClient } from './shared/api/queryClient';
import './index.css';
import './App.css';
import './shared/ui/ui.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#f1f5f9',
                borderRadius: '12px',
                fontSize: '0.9rem',
                padding: '0.75rem 1rem',
                boxShadow: '0 10px 32px rgba(15, 23, 42, 0.35)',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
