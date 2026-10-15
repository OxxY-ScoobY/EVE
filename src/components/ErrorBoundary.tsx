import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EVE Subsystem Diagnostic Failure:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReboot = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#040814',
            color: '#fff',
            padding: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'rgba(20, 8, 16, 0.9)',
              border: '1px solid #ff0055',
              boxShadow: '0 0 35px rgba(255, 0, 85, 0.3)',
              borderRadius: '12px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={32} color="#ff0055" />
              <div>
                <h1 style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#ff0055', margin: 0 }}>
                  CRITICAL SUBSYSTEM FAULT
                </h1>
                <p style={{ fontSize: '0.8rem', color: '#8b9bb4', margin: '4px 0 0' }}>
                  EVE Core Exception Handler Intercepted Runtime Error
                </p>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 0, 85, 0.2)',
                borderRadius: '6px',
                padding: '14px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#ff88aa',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
              }}
            >
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>

            <button
              onClick={this.handleReboot}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255, 0, 85, 0.15)',
                border: '1px solid #ff0055',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={16} />
              <span>REBOOT EVE SUBSYSTEM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
