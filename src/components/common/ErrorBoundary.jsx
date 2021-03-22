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

  render() {
    const { hasError } = this.state;
    return hasError ?
           <ErrorUI header='Error' message='Something went wrong.' /> :
           this.props.children;
  }
}

export default ErrorBoundary;
