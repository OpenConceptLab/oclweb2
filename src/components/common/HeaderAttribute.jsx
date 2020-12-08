import React from 'react';
import { isEmpty } from 'lodash';

const HeaderAttribute = ({label, value, gridClass}) => {
  let className = 'no-side-padding flex-vertical-start ' + (gridClass ? gridClass : 'col-md-4')
  return (
    <div className={className}>
      <span className='italic' style={{marginRight: '10px', color: 'rgba(0, 0, 0, 0.6)'}}>
        {label}:
      </span>
      <span>
        {isEmpty(value) ? 'None' : value}
      </span>
    </div>
  )
}

export default HeaderAttribute;
