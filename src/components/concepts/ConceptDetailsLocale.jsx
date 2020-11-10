import React from 'react';
import { Flag as FlagIcon } from '@material-ui/icons';
import { Chip, Tooltip } from '@material-ui/core';
import { get } from 'lodash';
import ExternalIdLabel from '../common/ExternalIdLabel';


const ConceptDetailsLocale = ({ locale, isDescription }) => {
  const typeAttr = isDescription ? 'description_type' : 'name_type'
  const nameAttr = isDescription ? 'description' : 'name'
  const type = get(locale, typeAttr);
  return (
    <div className='col-md-12' style={{marginBottom: '10px'}}>
      <div className='col-md-11 no-left-padding'>
        <div className='col-md-12 no-side-padding flex-vertical-center'>
          <span style={{marginRight: '10px'}}>{ get(locale, nameAttr) }</span>
          {
            type &&
            <span style={{marginRight: '10px'}}>
              <Chip style={{height: '20px', fontSize: '10px'}} size='small' variant='default' label={type} />
            </span>
          }
          <span className='gray-italics-small'>{`[${locale.locale}]`}</span>
          {
            locale.locale_preferred &&
            <span style={{marginRight: '5px'}}>
              <Tooltip title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
                <FlagIcon color='secondary' fontSize='small' style={{width: '18px', marginTop: '4px'}}/>
              </Tooltip>
            </span>
          }
        </div>
        {
          locale.external_id &&
          <ExternalIdLabel externalId={locale.external_id} iconSize='small' />
        }
      </div>
      <div className='col-md-1 no-right-padding'>
      </div>
    </div>
  );
}

export default ConceptDetailsLocale;
