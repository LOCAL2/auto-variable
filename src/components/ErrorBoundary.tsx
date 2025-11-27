import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-container fade-in" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: '2rem'
                }}>
                    <div className="glass-card" style={{
                        textAlign: 'center',
                        padding: '3rem',
                        maxWidth: '500px',
                        width: '100%'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {this.state.error?.message === 'Data too long'
                                ? 'The code snippet is too large to be shared via URL. Please try a smaller file.'
                                : 'We encountered an unexpected error. Please try again.'}
                        </p>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,0,0,0.1)',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            color: '#ef4444',
                            fontFamily: 'monospace'
                        }}>
                            Error: {this.state.error?.message || 'Unknown Error'}
                        </div>
                        <button
                            className="btn-primary"
                            onClick={() => window.location.href = window.location.origin}
                            style={{ width: '100%' }}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
