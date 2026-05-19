import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary — catches any unhandled React render error and
 * shows a recovery screen instead of a blank white page.
 *
 * Without this, a single unhandled exception unmounts the entire app tree
 * silently, leaving the user with an empty screen and no way to recover.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console so it shows in Vercel function logs / browser devtools
    console.error('[Star Homes] Uncaught render error:', error.message);
    console.error(info.componentStack);
  }

  handleReload = () => {
    // Reset state first so re-render is attempted before hard reload
    this.setState({ hasError: false, error: null });
    // If state reset alone doesn't fix it, a full reload will
    setTimeout(() => window.location.reload(), 50);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '100dvh',
          background: '#0F0C2E',
          padding: '32px',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #7F77DD 0%, #3C3489 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(60,52,137,0.4)',
          }}
        >
          <span style={{ fontSize: '36px', lineHeight: 1 }}>★</span>
        </div>

        <h1
          style={{
            color: '#FFFFFF',
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 10px',
            letterSpacing: '-0.4px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '14px',
            lineHeight: 1.6,
            margin: '0 0 32px',
            maxWidth: '260px',
          }}
        >
          Star Homes hit an unexpected error. Tap below to reload — your saved properties won't be lost.
        </p>

        <button
          onClick={this.handleReload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #4F47A8 0%, #3C3489 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '14px',
            padding: '16px 28px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(60,52,137,0.35)',
          }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} />
          Reload Star Homes
        </button>

        {/* Dev hint — only show in development */}
        {import.meta.env.DEV && this.state.error && (
          <p
            style={{
              marginTop: '24px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.25)',
              fontFamily: 'monospace',
              maxWidth: '320px',
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {this.state.error.message}
          </p>
        )}
      </div>
    );
  }
}
