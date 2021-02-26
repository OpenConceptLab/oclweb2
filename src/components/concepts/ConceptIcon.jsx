import React from 'react';
import {
  LocalOffer as LocalOfferIcon
} from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { toFullAPIURL, copyURL } from '../../common/utils';

const ConceptIcon = ({ url }) => {
  const onIconClick = () => copyURL(toFullAPIURL(url))

  return (
    <div className='no-side-padding col-md-1 home-icon concept flex-vertical-center' style={{width: '5%'}}>
      {
        url ?
        <Tooltip title='Copy URL'>
          <LocalOfferIcon onClick={onIconClick} className='default-svg' />
        </Tooltip> :
        <LocalOfferIcon className='default-svg' />
      }
    </div>
  );
}

export default ConceptIcon;
