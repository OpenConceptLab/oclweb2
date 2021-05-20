import React from 'react';
import { Flag as FlagIcon, FileCopy as CopyIcon } from '@material-ui/icons';
import { Chip, Tooltip, IconButton } from '@material-ui/core';
import { get } from 'lodash';
import ExternalIdLabel from '../common/ExternalIdLabel';
import { toFullAPIURL, copyURL } from '../../common/utils';


const ConceptDetailsLocale = ({ locale, isDescription, url }) => {
  const typeAttr = isDescription ? 'description_type' : 'name_type'
  const nameAttr = isDescription ? 'description' : 'name'
  const type = get(locale, typeAttr);
  const onCopyClick = () => copyURL(toFullAPIURL(url))

  return (
    <div className='col-md-12 flex-vertical-center'>
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
              <Tooltip arrow title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
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
        <Tooltip arrow title='Copy Link' placement='right'>
          <IconButton onClick={onCopyClick} color='primary' size='small'>
            <CopyIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

export default ConceptDetailsLocale;
