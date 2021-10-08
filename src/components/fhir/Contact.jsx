import React from 'react';
import { Divider } from '@mui/material'
import { isEmpty, map } from 'lodash';

const Contact = ({name, telecom}) => {
  const getHREF = (system, value) => {
    if(system === 'url')
      return value
    if(system === 'email')
      return `mailto:${value}`
    if(system === 'phone')
      return `tel:${value}`

  }

  return (
    <span className='flex-vertical-center'>
      {
        name &&
        <span>{name}</span>
      }
      {
        !isEmpty(telecom) &&
        map(
          telecom,
          (com, index) => (
            <React.Fragment key={index}>
              <a style={{marginLeft: '10px'}} href={getHREF(com.system, com.value)} rel="noopener noreferrer" target='_blank'>
                {com.value}
              </a>
              {
                (index !== telecom.length - 1) &&
                <Divider orientation="vertical" style={{height: '16px', marginLeft: '10px'}} />
              }

            </React.Fragment>
          )
        )
      }

    </span>
  )
}

export default Contact;
