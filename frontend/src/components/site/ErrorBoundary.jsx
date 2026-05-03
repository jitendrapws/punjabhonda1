import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[Punjab Honda] Render error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" data-testid="error-boundary">
        <div className="max-w-lg text-center">
          <div className="bg-honda text-white font-display font-black text-3xl px-4 py-2 inline-block mb-4">H</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight mb-3">Punjab Honda</h1>
          <p className="text-gray-700 mb-2">Something went wrong loading the page.</p>
          <p className="text-sm text-gray-500 mb-6">
            If you are the site owner: check that <code className="bg-gray-100 px-1 py-0.5 text-xs">REACT_APP_BACKEND_URL</code> is configured in your hosting environment, and that the backend is reachable.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-honda hover:bg-honda-dark text-white px-6 py-3 text-xs font-bold uppercase tracking-wider"
            data-testid="error-reload-btn"
          >
            Reload Page
          </button>
          <details className="mt-6 text-left text-xs text-gray-500">
            <summary className="cursor-pointer">Technical details</summary>
            <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 overflow-auto">
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
