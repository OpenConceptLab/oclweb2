import React from 'react';
import DynamicConfigResourceIcon from '../../common/DynamicConfigResourceIcon';

const FormHeader = props => {
  return (
    <div className='col-xs-12 no-side-padding' style={{display: 'flex'}}>
      <span style={{display: 'inline-block'}}>
        <DynamicConfigResourceIcon resource={props.resource} enableColor style={{fontSize: '4em', marginTop: '8px'}} />
      </span>
      <span style={{marginLeft: '10px', display: 'inline-block'}}>
        <div className='col-xs-12 no-side-padding'>
          <h1 style={{marginBottom: 0, marginTop: '12px'}}>{props.edit ? props.editTitle : props.title}</h1>
        </div>
        <div className='col-xs-12 no-side-padding form-text-gray' style={{fontSize: '16px'}}>
          {props.subTitle}
        </div>
      </span>
    </div>
  )
}

export default FormHeader;
