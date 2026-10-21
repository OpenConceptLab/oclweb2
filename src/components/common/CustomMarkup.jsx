import React from 'react';
import SafeHTML from './SafeHTML';

const CustomMarkup = ({title, markup}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      { title && <h3> { title } </h3> }
      {
        markup &&
        <SafeHTML className='col-md-12 no-side-padding' html={markup} hashLinks />
      }
    </div>
  );
}

export default CustomMarkup;
