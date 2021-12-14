import React from 'react';
import { isEmpty } from 'lodash'
import Pins from '../common/Pins';
import Members from './Members';

const Overview = ({ org, pins, onPinDelete, onPinOrderUpdate, canDeletePin, members }) => {
  return (
    <div className='col-md-12 no-side-padding'>
      <div className='col-xs-9 no-side-padding'>
      <Pins
        pins={pins}
        onDelete={onPinDelete}
        canDelete={canDeletePin}
        onOrderUpdate={onPinOrderUpdate}
        style={{marginBottom: '5px', padding: '0 10px'}}
      />
      {
        org.text &&
        <div className='col-md-12' dangerouslySetInnerHTML={{__html: org.text.replaceAll('href="/', 'href="/#/')}} />
      }
      </div>
      {
        !isEmpty(members) &&
        <div className='col-xs-3 no-side-padding'>
          <Members members={members} />
        </div>
      }
    </div>
  )
}

export default Overview;
