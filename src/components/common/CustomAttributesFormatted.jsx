import React from 'react';
import { map, isEmpty, isBoolean, isArray, isObject, find } from 'lodash';

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const CustomAttributesFormatted = ({attributes}) => {
  const shouldBeNested = value => {
    return isArray(value) && Boolean(find(value, isObject))
  }

  const getNestedValueDom = (value, index) => {
    return isObject(value) ?
           <details key={index}>
             <summary>{`${JSON.stringify(value).slice(0, 50)}...`}</summary>
             <pre style={{fontSize: '12px'}}>{JSON.stringify(value, undefined, 2)}</pre>
           </details> :
           <code key={index}>{JSON.stringify(value)}</code>
  }

  return (
    <div className="col-md-12 no-side-padding">
      {
        isEmpty(attributes) ?
        None() :
        map(attributes, (value, name) => {
          const isBool = isBoolean(value)
          const needNesting = !isBool && shouldBeNested(value)
          const isArr = isArray(value)
          return (
            <div className='col-md-12' style={{marginBottom: '5px'}} key={name}>
              <div style={{fontWeight: '300'}} className='col-md-3 no-left-padding'>
                {name}
              </div>
              <div className='col-md-9 no-right-padding ellipsis-text' style={{maxWidth: '100%'}}>
                {
                  isBool && value.toString()
                }
                {
                  needNesting &&
                  map(value, (val, index) => getNestedValueDom(val, index))
                }
                {
                  isArr && !needNesting &&
                  <pre style={{margin: '0'}}>{JSON.stringify(value)}</pre>
                }
                {
                  !isBool && !needNesting && !isArr && isObject(value) &&
                  getNestedValueDom(value)
                }
                {
                  !isBool && !needNesting && !isArr && !isObject(value) &&
                  value
                }
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export default CustomAttributesFormatted;
