import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          Something went wrong in this section.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
