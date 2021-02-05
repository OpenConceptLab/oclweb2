import React from 'react';
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';

const JSONEditor = props => {
  return (
    <JSONInput locale={ locale } height='auto' width='100%' {...props} />
  )
}

export default JSONEditor;
