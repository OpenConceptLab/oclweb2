import React from 'react';
import { isEmpty, includes, isString } from 'lodash';
import { formatDate, formatWebsiteLink } from '../../common/utils';

const getURLComponent = val => formatWebsiteLink(val);
const getBoolComponent = val => val ? 'True' : 'False';
const getDateComponent = val => formatDate(val);
const getJSONComponent = val => {
  if(isString(val)) {
    try {
      val = JSON.parse(val)
    } catch {
      //do nothing
    }
  }
  return <pre style={{margin: '0px'}}>{JSON.stringify(val, undefined, 1)}</pre>;
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
  const isValid = () => {
    if(type === 'boolean')
      return !includes([null, undefined], value)
    return !isEmpty(value) && !includes(['none', 'None'], value);
  }

  return (
    <React.Fragment>
      {
        isValid() &&
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
