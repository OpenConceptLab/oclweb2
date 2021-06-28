import React from 'react';
import CustomMarkup from './CustomMarkup';
import CustomMarkdown from './CustomMarkdown';

const CustomText = ({title, value, format, url}) => {
  const [urlText, setURLText] = React.useState(null);
  const [fetched, setFetched] = React.useState(false)
  if(url && !urlText && !fetched) {
    setFetched(true)
    fetch(url).then(response => response.text()).then(text => setURLText(text))
  }
  return (
    <div className='col-md-12 no-side-padding'>
      { title && <h3> { title } </h3> }
      { format === 'md' && <CustomMarkdown markdown={value} /> }
      { format === 'text' && <div> { value } </div> }
      { (!format || format === 'html') && <CustomMarkup markup={value} /> }
      {
        (!format || format === 'html') && urlText && <CustomMarkup markup={urlText} />
      }
      {
        (format === 'md') && urlText && <CustomMarkdown markdown={urlText} />
      }
      {
        (format === 'text') && urlText && <div> {urlText} </div>
      }
    </div>
  );
}

export default CustomText;
