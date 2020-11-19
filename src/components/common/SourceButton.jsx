import React from 'react';
import { Button } from '@material-ui/core';
import { List as ListIcon } from '@material-ui/icons';
import { GREEN, WHITE } from '../../common/constants';
import { toParentURI } from '../../common/utils';

const SourceButton = ({label, onClick, href, childURI}) => {
  let uri = href
  if(childURI) uri = '#' + toParentURI(childURI);

  return (
    <Button
      variant='contained'
      startIcon={<ListIcon />}
      onClick={onClick}
      href={uri}
      style={{background: GREEN, color: WHITE, boxShadow: 'none'}}>
      {label}
    </Button>
  )
}

export default SourceButton;
