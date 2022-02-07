import React from 'react';
import { BLUE, WHITE } from '../../common/constants';
import { isNumber } from 'lodash';

const TabCountLabel = ({label, count, style, color}) => {
  if(!isNumber(count))
    return <span style={style}>{label}</span>;

  return (
    <span>
      <span style={style}>{label}</span>
      <span className="resource-count-bubble" style={{backgroundColor: color || BLUE, color: WHITE}}>
        {count.toLocaleString()}
      </span>
    </span>
  )
}

export default TabCountLabel;
