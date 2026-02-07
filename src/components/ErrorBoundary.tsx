import { Component, ErrorInfo, ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="error-overlay">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <pre className="error-message">{this.state.error.message}</pre>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
