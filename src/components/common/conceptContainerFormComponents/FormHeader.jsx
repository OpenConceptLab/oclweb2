import React from 'react';
import DynamicConfigResourceIcon from '../../common/DynamicConfigResourceIcon';
import { WHITE } from '../../../common/constants'

const FormHeader = props => {
  const iconMarginTop = props.resource === 'source' ? '8px' : '20px'
  return (
    <div className='col-xs-12' style={{display: 'flex', position: 'fixed', background: WHITE, zIndex: '1999'}}>
      <span style={{display: 'inline-block'}}>
        <DynamicConfigResourceIcon resource={props.resource} enableColor style={{fontSize: '4em', marginTop: iconMarginTop}} />
      </span>
      <span style={{marginLeft: '10px', display: 'inline-block'}}>
        <div className='col-xs-12 no-side-padding'>
          <h1 style={{marginBottom: 0, marginTop: '12px', fontSize: '24px'}}>{props.edit ? props.editTitle : props.title}</h1>
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{fontSize: '16px'}}>
          {props.subTitle}
        </div>
      </span>
    </div>
  )
}

export default FormHeader;
