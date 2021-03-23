import React from 'react';
import ErrorUI from './ErrorUI';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({error: error, errorInfo: errorInfo, hasError: Boolean(error)})
  }

  getErrorUIProps() {
    const props = {header: 'Error', message: 'Something went wrong.'}

    if(window.location.hash.match(/debug=true/))
      return {...props, error: this.state.error, errorInfo: this.state.errorInfo}

    return props
  }

  render() {
    const props = this.getErrorUIProps()
    const { hasError } = this.state;
    return hasError ? <ErrorUI {...props} /> : this.props.children;
  }
}

export default ErrorBoundary;
