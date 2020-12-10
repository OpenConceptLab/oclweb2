import React from 'react';
import { isEmpty } from 'lodash';
import { formatDate } from '../../common/utils';

const getURLComponent = val => {
  return <a href={val} target="_blank" rel="noopener noreferrer">{val}</a>;
}
const getJSONComponent = val => {
  return <pre style={{margin: '0px'}}>{JSON.stringify(val, undefined, 1)}</pre>;
}
const getBoolComponent = val => {
  return val ? 'True' : 'False';
}
const getDateComponent = val => {
  return formatDate(val);
}

const HeaderAttribute = ({label, value, gridClass, type}) => {
  const valueType = type || 'text';
  const className = 'no-side-padding flex-vertical-start ' + (gridClass ? gridClass : 'col-md-4')
  const getValueComponent = () => {
    if(valueType === 'text')
      return value;
    if (valueType === 'json')
      return getJSONComponent(value)
    if (valueType === 'url')
      return getURLComponent(value)
    if (valueType === 'boolean')
      return getBoolComponent(value)
    if (valueType === 'date')
      return getDateComponent(value)

    return value;
  }

  return (
    <React.Fragment>
      {
        !isEmpty(value) &&
        <div className={className}>
          <span className='italic' style={{marginRight: '10px', color: 'rgba(0, 0, 0, 0.6)'}}>
            {label}:
          </span>
          <span>
            {getValueComponent()}
          </span>
        </div>
      }
    </React.Fragment>
  )
}

export default HeaderAttribute;
