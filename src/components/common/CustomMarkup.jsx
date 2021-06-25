import React from 'react';

const CustomMarkup = ({title, markup}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      { title && <h3> { title } </h3> }
      {
        markup &&
        <div className='col-md-12 no-side-padding' dangerouslySetInnerHTML={{__html: markup.replaceAll('href="/', 'href="/#/')}} />
      }
    </div>
  );
}

export default CustomMarkup;
