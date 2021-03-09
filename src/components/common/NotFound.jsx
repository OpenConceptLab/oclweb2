import React from 'react';
import { Divider } from '@material-ui/core'

const NotFound = () => {
  return (
    <div className='not-found'>
      <h1>404</h1>
      <Divider orientation="vertical" />
      <div className='not-found-text'>
        <h2>This is not the page you are looking for.</h2>
      </div>
    </div>
  )
}

export default NotFound;
