import React, { Component, ReactNode } from 'react';

interface ErrorFallbackProps {
  onRefresh: () => void;
  onGoHome: () => void;
}

// Standalone error fallback UI - uses inline styles (no external CSS dependency)
// This ensures the error page renders even if any CSS framework fails
function ErrorFallback({ onRefresh, onGoHome }: ErrorFallbackProps) {
  const styles = {
    container: {
      backgroundColor: '#f5f7f8',
      color: '#0d131c',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      fontFamily: "'Heebo', 'Inter', sans-serif",
      direction: 'rtl' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #e7ecf4',
      padding: '12px 24px',
      backgroundColor: '#ffffff',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      color: '#3c83f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(60, 131, 246, 0.1)',
      borderRadius: '8px',
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 700,
      margin: 0,
    },
    mainWrapper: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '256px',
      backgroundColor: '#ffffff',
      borderLeft: '1px solid #e7ecf4',
      padding: '24px 16px',
      gap: '8px',
    },
    sidebarSection: {
      padding: '0 12px',
      marginBottom: '8px',
      fontSize: '12px',
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    sidebarLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 12px',
      borderRadius: '8px',
      color: '#0d131c',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'background-color 0.2s',
    },
    sidebarIcon: {
      color: '#64748b',
      fontSize: '20px',
    },
    divider: {
      margin: '8px 0',
      borderTop: '1px solid #e7ecf4',
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f5f7f8',
      overflow: 'auto',
    },
    content: {
      width: '100%',
      maxWidth: '512px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
    },
    illustrationWrapper: {
      marginBottom: '32px',
      position: 'relative' as const,
    },
    blob: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '192px',
      height: '192px',
      backgroundColor: 'rgba(60, 131, 246, 0.2)',
      borderRadius: '50%',
      filter: 'blur(48px)',
    },
    iconWrapper: {
      position: 'relative' as const,
      backgroundColor: '#ffffff',
      padding: '32px',
      borderRadius: '50%',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    warningIcon: {
      fontSize: '80px',
      color: '#3c83f6',
    },
    headline: {
      color: '#0d131c',
      fontSize: '30px',
      fontWeight: 700,
      lineHeight: 1.2,
      marginBottom: '16px',
      margin: '0 0 16px 0',
    },
    bodyText: {
      color: '#49699c',
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.6,
      marginBottom: '40px',
      maxWidth: '400px',
      margin: '0 0 40px 0',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row' as const,
      gap: '16px',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
    },
    buttonSecondary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      border: '1px solid #e7ecf4',
      backgroundColor: '#ffffff',
      color: '#0d131c',
      fontWeight: 700,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontFamily: "'Heebo', 'Inter', sans-serif",
    },
    buttonPrimary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#3c83f6',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '14px',
      cursor: 'pointer',
      boxShadow: '0 10px 15px -3px rgba(60, 131, 246, 0.3)',
      transition: 'background-color 0.2s',
      fontFamily: "'Heebo', 'Inter', sans-serif",
    },
    buttonIcon: {
      fontSize: '20px',
    },
    errorCode: {
      marginTop: '48px',
      fontSize: '14px',
      color: '#64748b',
    },
    errorCodeBadge: {
      fontFamily: 'monospace',
      backgroundColor: '#e7ecf4',
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '12px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <span className="material-symbols-outlined">grid_view</span>
          </div>
          <h2 style={styles.logoText}>מערכת ניהול</h2>
        </div>
      </header>

      <div style={styles.mainWrapper}>
        {/* Sidebar - hidden on mobile via media query would need JS, keeping simple */}
        <nav style={styles.sidebar}>
          <div style={styles.sidebarSection}>ראשי</div>
          <a style={styles.sidebarLink} href="#/">
            <span className="material-symbols-outlined" style={styles.sidebarIcon}>dashboard</span>
            <span>לוח בקרה</span>
          </a>
          <a style={styles.sidebarLink} href="#/users">
            <span className="material-symbols-outlined" style={styles.sidebarIcon}>group</span>
            <span>משתמשים</span>
          </a>
          <a style={styles.sidebarLink} href="#/analytics">
            <span className="material-symbols-outlined" style={styles.sidebarIcon}>analytics</span>
            <span>דוחות</span>
          </a>
          <div style={styles.divider}></div>
          <div style={styles.sidebarSection}>מערכת</div>
          <a style={styles.sidebarLink} href="#/settings">
            <span className="material-symbols-outlined" style={styles.sidebarIcon}>settings</span>
            <span>הגדרות</span>
          </a>
        </nav>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.content}>
            {/* Illustration */}
            <div style={styles.illustrationWrapper}>
              <div style={styles.blob}></div>
              <div style={styles.iconWrapper}>
                <span className="material-symbols-outlined" style={styles.warningIcon}>warning_amber</span>
              </div>
            </div>

            {/* Headline */}
            <h1 style={styles.headline}>אופס! משהו השתבש</h1>

            {/* Body Text */}
            <p style={styles.bodyText}>
              נתקלנו בשגיאה בלתי צפויה. אנחנו כבר עובדים על התיקון. ניתן לנסות לרענן את הדף או לחזור ללוח הבקרה
            </p>

            {/* Action Buttons */}
            <div style={styles.buttonContainer}>
              <button
                onClick={onRefresh}
                style={styles.buttonSecondary}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <span className="material-symbols-outlined" style={styles.buttonIcon}>refresh</span>
                <span>רענן דף</span>
              </button>
              <button
                onClick={onGoHome}
                style={styles.buttonPrimary}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(60, 131, 246, 0.9)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3c83f6'}
              >
                <span className="material-symbols-outlined" style={{ ...styles.buttonIcon, transform: 'scaleX(-1)' }}>arrow_back</span>
                <span>חזרה ללוח הבקרה</span>
              </button>
            </div>

            {/* Error Code */}
            <div style={styles.errorCode}>
              <p>קוד שגיאה: <span style={styles.errorCodeBadge}>ERR_UNEXPECTED</span></p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRefresh={this.handleRefresh} onGoHome={this.handleGoHome} />;
    }
    return this.props.children;
  }
}
