import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * 🛡️ Global Error Boundary
 * Catches React component errors and displays user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error tracking service)
    console.error('🔴 ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // TODO: Send error to error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided by parent
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500/50">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-4">
              ⚠️ Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-white/70 text-center mb-8">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>

            {/* Error Details (collapsible) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 bg-black/30 rounded-lg p-4 border border-red-500/30">
                <summary className="text-red-400 font-mono text-sm cursor-pointer hover:text-red-300 transition-colors">
                  🔍 Error Details (Development Mode)
                </summary>
                <div className="mt-4 space-y-2">
                  <div className="text-red-300 font-mono text-xs break-all">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-red-300/80 font-mono text-xs break-all max-h-40 overflow-auto">
                      <strong>Component Stack:</strong>
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Reload Page
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 text-center text-white/50 text-sm">
              <p>If the problem persists, please contact support or check the browser console.</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 📦 Fallback component for specific error scenarios
 */
export function ErrorFallback({
  error,
  resetError
}: {
  error: Error
  resetError?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Error Loading Component</h3>
      <p className="text-white/70 text-sm text-center mb-4">{error.message}</p>
      {resetError && (
        <button
          onClick={resetError}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded text-white text-sm transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorBoundary
