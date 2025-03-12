import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="text-center py-5">
                    <div className="error-boundary-container">
                        <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                        <h3 className="text-gray-800">Something went wrong</h3>
                        <p className="text-gray-600">
                            Please try refreshing the page or contact support if the problem persists.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallbackMessage: PropTypes.string
};

export default ErrorBoundary;