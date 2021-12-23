import React from 'react';
import { isEmpty } from 'lodash'
import { Home as OrgIcon } from '@mui/icons-material';
import Pins from '../common/Pins';
import PinIcon from '../common/PinIcon';
import Members from './Members';

const Overview = ({ org, pins, onPinDelete, onPinOrderUpdate, canDeletePin, members }) => {
  const about = org.text === '<p><br></p>' ? '' : org.text;
  return (
    <div className='col-md-12 no-side-padding'>
      <div className='col-xs-9 no-side-padding'>
        <div className='col-xs-12 no-side-padding'>
          {
            isEmpty(pins) ?
            <React.Fragment>
              <h3 style={{margin: '10px 0px', display: 'flex', alignItems: 'center'}}>
                <PinIcon pinned="true" fontSize='small' style={{marginRight: '5px'}} />
                Pinned
              </h3>
              <p style={{marginLeft: '15px', marginTop: '10px'}}>
                {`${org.id} doesn't have any pinned content yet.`}
              </p>
            </React.Fragment> :
            <Pins
              pins={pins}
              onDelete={onPinDelete}
              canDelete={canDeletePin}
              onOrderUpdate={onPinOrderUpdate}
              style={{marginBottom: '5px', padding: '0 10px'}}
            />
          }
        </div>
        <div className='col-xs-12 no-side-padding'>
          <h3 style={{margin: '10px 0px', display: 'flex', alignItems: 'center', marginTop: '30px'}}>
            <OrgIcon fontSize='small' style={{marginRight: '5px'}} />
            {`About ${org.id}`}
          </h3>
          {
            isEmpty(about) ?
            <p style={{marginLeft: '15px', marginTop: '10px'}}>
              {`${org.id} doesn't have any about text yet.`}
            </p> :
            <div className='col-md-12' dangerouslySetInnerHTML={{__html: org.text.replaceAll('href="/', 'href="/#/')}} />
          }
        </div>
      </div>
      {
        !isEmpty(members) &&
        <div className='col-xs-3 no-side-padding'>
          <Members members={members} org={org} />
        </div>
      }
    </div>
  )
}

export default Overview;
