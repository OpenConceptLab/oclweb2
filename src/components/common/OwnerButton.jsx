import React from 'react';
import OrgButton from './OrgButton';
import UserButton from './UserButton';
import { get } from 'lodash';
import { toOwnerURI } from '../../common/utils';

const OwnerButton = props => {
  const ownerType = (
    get(props, 'ownerType', '') ||
    get(props, 'owner_type', '')
  ).toLowerCase();
  const uri = '#' + toOwnerURI(props.href || '')

  return (
    <span>
      {
        ownerType === 'user' ?
        <UserButton href={uri} label={props.owner} onClick={props.onClick} /> :
        <OrgButton href={uri} label={props.owner} onClick={props.onClick} />
      }
    </span>
  );
}

export default OwnerButton;
