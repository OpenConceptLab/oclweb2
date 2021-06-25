import React from 'react';
import CustomMarkup from './CustomMarkup';
import CustomMarkdown from './CustomMarkdown';

const CustomText = ({title, value, format}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      { title && <h3> { title } </h3> }
      { format === 'md' && <CustomMarkdown markdown={value} /> }
      { format === 'text' && <div> { value } </div> }
      { (!format || format === 'html') && <CustomMarkup markup={value} /> }
    </div>
  );
}

export default CustomText;
