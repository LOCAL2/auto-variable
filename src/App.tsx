import { useState, useEffect } from 'react';
import Generator from './components/Generator';
import Receiver from './components/Receiver';
import History from './components/History';
import CreditModal from './components/CreditModal';
import { decompressState } from './utils/urlState';
import './App.css';

import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/ThemeSwitcher';

interface Variable {
  name: string;
  color: string;
}

interface AppState {
  code: string;
  targetVar?: string;
  variables?: Variable[];
  filename?: string;
}

function App() {
  const [decodedState, setDecodedState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'generator' | 'receiver' | 'history'>('generator');

  useEffect(() => {
    const handleLoad = async () => {
      const path = window.location.pathname;
      if (path === '/history') {
        setCurrentPage('history');
        setLoading(false);
        return;
      }

      if (path && path.length > 1 && path !== '/') {
        let gistId = path.substring(1);
        
        // Check if it's a short URL (starts with 'data/')
        if (gistId.startsWith('data/')) {
          const shortCode = gistId.substring(5);
          try {
            const { resolveShortUrl } = await import('./utils/shortUrlService');
            const resolvedGistId = await resolveShortUrl(shortCode);
            if (resolvedGistId) {
              gistId = resolvedGistId;
            } else {
              console.error('Short URL not found');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Failed to resolve short URL:', error);
            setLoading(false);
            return;
          }
        }
        
        try {
          const { getGist } = await import('./utils/gistService');
          const state = await getGist(gistId);
          if (state) {
            setDecodedState(state);
            setCurrentPage('receiver');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Failed to load from Gist:', error);
        }
      }

      // Fallback to hash-based (original method)
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const state = await decompressState(hash);
        setDecodedState(state);
        setCurrentPage('receiver');
      } else {
        setDecodedState(null);
        setCurrentPage('generator');
      }
      setLoading(false);
    };

    handleLoad();

    window.addEventListener('hashchange', handleLoad);
    window.addEventListener('popstate', handleLoad);
    return () => {
      window.removeEventListener('hashchange', handleLoad);
      window.removeEventListener('popstate', handleLoad);
    };
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="app-container">
          {currentPage === 'history' ? (
            <History />
          ) : currentPage === 'receiver' && decodedState ? (
            <Receiver
              initialCode={decodedState.code}
              targetVar={decodedState.targetVar}
              variables={decodedState.variables}
              filename={decodedState.filename}
            />
          ) : (
            <Generator />
          )}

          <ThemeSwitcher />

          <button
            className="credit-fab fade-in"
            onClick={() => setIsModalOpen(true)}
            aria-label="Credit by Barron"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          <CreditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
