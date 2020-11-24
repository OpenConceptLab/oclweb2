import React from 'react';
import { Button } from '@material-ui/core';
import { Loyalty as LoyaltyIcon } from '@material-ui/icons';
import { GREEN, WHITE } from '../../common/constants';
import { toParentURI } from '../../common/utils';

const CollectionButton = ({label, onClick, href, childURI}) => {
  let uri = href
  if(childURI) uri = '#' + toParentURI(childURI);

  return (
    <Button
      variant='contained'
      startIcon={<LoyaltyIcon />}
      onClick={onClick}
      href={uri}
      style={{background: GREEN, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default CollectionButton;
