import React from 'react';
import ErrorUI from './ErrorUI';

const NotFound = () => {
  return (
    <ErrorUI header='404' message='This is not the page you are looking for.' />
  )
}

export default NotFound;
