import React from 'react';
import { Link } from 'react-router-dom';
import {
  Person as PersonIcon,
  AccountBalance as HomeIcon,
  List as ListIcon,
  Loyalty as LoyaltyIcon,
  AccountTreeRounded as TreeIcon,
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';

const SEPARATOR = (<SeparatorIcon />)
const ConceptContainerLabel = props => {
  const ownerType = (props.ownerType || props.owner_type || '').toLowerCase()

  let icon = <LoyaltyIcon fontSize='small' />;
  if(props.resource === 'source')
    icon = <ListIcon fontSize='small' /> ;

  let ownerIcon = <HomeIcon fontSize='small' />;
  if(ownerType === 'users')
    ownerIcon = <PersonIcon fontSize='small' />;

  return (
    <div className='col-sm-12 no-side-padding flex-vertical-center' style={{margin: '5px 0'}}>
      <Link to={props.uri} className='no-anchor-styles flex-vertical-center'>
        {
          props.owner && props.ownerType &&
          <React.Fragment>
            <span className='resource-label resource-id orange' style={{borderRadius: '0.25em'}}>
              <span style={{paddingTop: '5px'}}>{ownerIcon}</span>
              <span>{props.owner}</span>
            </span>
            <span className='separator-small'>{SEPARATOR}</span>
          </React.Fragment>
        }
        <span className='resource-label resource-id green' style={{borderRadius: '0.25em'}}>
          <span style={{paddingTop: '5px'}}>{icon}</span>
          <span>{props.id}</span>
        </span>
        {
          props.version &&
          <React.Fragment>
            <span className='separator-small'>{SEPARATOR}</span>
            <span className='resource-label resource-id green' style={{borderRadius: '0.25em'}}>
              <span style={{paddingTop: '5px'}}><TreeIcon fontSize='small' /></span>
              <span>{props.version}</span>
            </span>
          </React.Fragment>
        }
      </Link>
    </div>
  )
}

export default ConceptContainerLabel;
