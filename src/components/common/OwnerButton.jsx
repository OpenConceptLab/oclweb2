import React from 'react';
import OrgButton from './OrgButton';
import UserButton from './UserButton';
import { toOwnerURI } from '../../common/utils';

const OwnerButton = ({uri, href, ownerType, owner_type, owner, onClick , ...rest}) => {
  const _uri = uri ? uri : '#' + toOwnerURI(href || '')
  let _ownerType = (ownerType || owner_type || '').toLowerCase();
  if(!_ownerType && _uri)
    _ownerType = _uri.match('/users/') ? 'user' : 'org';

  return (
    <span>
      {
        _ownerType === 'user' ?
        <UserButton href={_uri} label={owner} onClick={onClick} {...rest} /> :
        <OrgButton href={_uri} label={owner} onClick={onClick} {...rest} />
      }
    </span>
  );
}

export default OwnerButton;
