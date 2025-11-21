import { useState, useEffect } from 'react';
// @ts-ignore
import Generator from './components/Generator';
// @ts-ignore
import Receiver from './components/Receiver';
// @ts-ignore
import CreditModal from './components/CreditModal';
// @ts-ignore
import { decompressState } from './utils/urlState';
import './App.css';

// @ts-ignore
import { ToastProvider } from './context/ToastContext';
// @ts-ignore
import { ThemeProvider } from './context/ThemeContext';
// @ts-ignore
import ThemeSwitcher from './components/ThemeSwitcher';

function App() {
  const [decodedState, setDecodedState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const state = await decompressState(hash);
        setDecodedState(state);
      } else {
        setDecodedState(null);
      }
      setLoading(false);
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="app-container">
          {decodedState ? (
            <Receiver
              initialCode={decodedState.code}
              targetVar={decodedState.targetVar}
              variables={decodedState.variables}
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
