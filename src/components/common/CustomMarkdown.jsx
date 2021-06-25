import React from 'react';
import ReactMarkdown from 'react-markdown'

const CustomMarkdown = ({title, markdown}) => {
  return (
    <div className='col-md-12 no-side-padding'>
      { title && <h3> { title } </h3> }
      { markdown && <ReactMarkdown>{ markdown }</ReactMarkdown> }
    </div>
  );
}

export default CustomMarkdown;
