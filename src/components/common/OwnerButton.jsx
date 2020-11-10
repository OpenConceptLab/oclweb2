import React from 'react';
import OrgButton from './OrgButton';
import UserButton from './UserButton';
import { get } from 'lodash';

const OwnerButton = props => {
  const ownerType = (
    get(props, 'ownerType', '') ||
    get(props, 'owner_type', '')
  ).toLowerCase();

  return (
    <span>
      {
        ownerType === 'user' ?
        <UserButton label={props.owner} onClick={props.onClick} /> :
        <OrgButton label={props.owner} onClick={props.onClick} />
      }
    </span>
  );
}

export default OwnerButton;
