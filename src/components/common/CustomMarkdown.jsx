import React from 'react';
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import './CustomMarkdown.scss'

const CustomMarkdown = ({title, markdown}) => {
  return (
    <div className='col-md-12 no-side-padding custom-markdown'>
      { title && <h3> { title } </h3> }
      {
        markdown &&
        <ReactMarkdown escapeHtml={false} remarkPlugins={[gfm]} children={markdown} />
      }
    </div>
  );
}

export default CustomMarkdown;
