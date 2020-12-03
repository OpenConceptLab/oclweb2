import React from 'react';
import { isEmpty } from 'lodash';

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const CustomAttributes = ({attributes}) => {
  return (
    <div className="col-md-12 no-side-padding">
      {
        isEmpty(attributes) ?
        None() :
        <pre>{JSON.stringify(attributes, undefined, 2)}</pre>
      }
    </div>
  )
}

export default CustomAttributes;
