import React from 'react';
import ErrorUI from './ErrorUI';

const PermissionDenied = () => {
  return (
    <ErrorUI
      header='403'
      message="You do not have permission to perform this action."
    />
  )
}

export default PermissionDenied;
