import React from 'react';
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import './CustomMarkdown.scss'

const CustomMarkdown = ({title, markdown, classes, id}) => {
  return (
    <div id={id} className={`col-md-12 no-side-padding custom-markdown ${classes || ''}`}>
      { title && <h3> { title } </h3> }
      {
        markdown &&
        <ReactMarkdown escapeHtml={false} remarkPlugins={[gfm]}>
          { markdown }
        </ReactMarkdown>
      }
    </div>
  );
}

export default CustomMarkdown;
