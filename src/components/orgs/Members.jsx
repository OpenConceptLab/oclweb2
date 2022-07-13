import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Stack, IconButton, Divider, Badge } from '@mui/material'
import {
  List as SourceIcon, Loyalty as CollectionIcon, Home as OrgIcon,
  AdminPanelSettings as AdminIcon, PersonOff as UserDisabledIcon,
  PrivacyTip as UnverifiedIcon,
  VerifiedUser as VerifiedIcon,
  SafetyCheck as VerificationPendingIcon,
} from '@mui/icons-material';
import { map, chunk, isEmpty } from 'lodash';
import { GREEN, ORANGE } from '../../common/constants'
import { getUserInitials } from '../../common/utils';
import HtmlToolTipRaw from '../common/HtmlToolTipRaw';

const Identity = ({member, size}) => {
  const width = size || '50px';
  return (
    <React.Fragment>
      {
        member.logo_url ?
        <Link to={member.url}>
          <Avatar alt={member.name} src={member.logo_url} style={{width: width, height: width}} />
        </Link> :
        <IconButton touch='true' href={`/#${member.url}`} className='no-anchor-styles' style={{border: `1px solid gray`, width: width, height: width}}>
          {getUserInitials(member)}
        </IconButton>
      }
    </React.Fragment>
  )
}

const IdentityBadge = ({member, size}) => {
  const isAdmin = member.is_superuser || member.is_staff;
  let icon = null;
  if(isAdmin)
    icon = <AdminIcon color='success' />;
  else if (member.status === 'deactivated')
    icon = <UserDisabledIcon color='error' style={{width: '20px'}} />;
  else if (member.status === 'unverified')
    icon = <UnverifiedIcon color='warning' style={{width: '20px'}} />;
  else if (member.status === 'verified')
    icon = <VerifiedIcon color='success' style={{width: '20px'}} />;
  else if (member.status === 'verification_pending')
    icon = <VerificationPendingIcon color='warning' style={{width: '20px'}} />;

  return (
    <React.Fragment>
      {
        icon ?
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={icon}
          >
          <Identity member={member} size={size} />
        </Badge> :
        <Identity member={member} size={size} />
      }
    </React.Fragment>
  )
}

const Info = ({ member }) => {
  return (
    <div className='col-xs-12 no-side-padding' style={{fontSize: '14px'}}>
      <div className='col-xs-12 flex-vertical-center' style={{padding: '8px 0'}}>
        <span style={{marginRight: '10px', display: 'inline-block'}}>
          <IdentityBadge member={member} />
        </span>
        <Link to={member.url} className='no-anchor-styles'>
          <div style={{fontWeight: 'bold', fontSize: '16px'}}>
            {member.name}
          </div>
          <div style={{color: 'rgba(0, 0, 0, 0.7)', fontSize: '16px'}}>
            {member.username}
          </div>
        </Link>
      </div>
      <Divider style={{width: '100%'}} />
      <div className='col-xs-12' style={{padding: '8px 0'}}>
        {
          member.sources > 0 &&
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{fontSize: '14px'}}>
            <Link to={`${member.url}sources`} className='no-anchor-styles flex-vertical-center'>
              <React.Fragment>
                <SourceIcon style={{marginRight: '5px', width: '18px', color: GREEN}} />
                <span>{`Owner of ${member.sources} public sources`}</span>
              </React.Fragment>
            </Link>
          </div>
        }
        {
          member.collections > 0 &&
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{fontSize: '14px'}}>
            <Link to={`${member.url}collections`} className='no-anchor-styles flex-vertical-center'>
              <React.Fragment>
                <CollectionIcon style={{marginRight: '5px', width: '18px', color: GREEN}} />
                <span>{`Owner of ${member.collections} public collections`}</span>
              </React.Fragment>
            </Link>
          </div>
        }

        {
          member.organizations > 0 &&
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{fontSize: '14px'}}>
            <Link to={`${member.url}organizations`} className='no-anchor-styles flex-vertical-center'>
              <React.Fragment>
                <OrgIcon style={{marginRight: '5px', width: '18px', color: ORANGE}} />
                <span>{`Member of ${member.organizations} organizations`}</span>
              </React.Fragment>
            </Link>
          </div>
        }
      </div>
    </div>
  )
}


const Members = ({ members, org }) => {
  const hasMore = members.length > 15
  const chunks = chunk(members.slice(0, 15), 5)
  return (
    <div className='col-xs-12' style={{padding: 0, paddingLeft: '20px'}}>
      <h3 style={{margin: '10px 0px', display: 'flex', alignItems: 'center'}}>
        Members
      </h3>
      {
        isEmpty(members) ?
        <div className='col-xs-12'>
          No members
        </div> :
        <React.Fragment>
          {
            map(chunks, (group, index) => (
              <Stack direction="row" spacing={1} key={index} style={{padding: '5px 0'}}>
                {
                  map(group, member => (
                    <HtmlToolTipRaw placement='top' title={<Info member={member} />} key={member.username} arrow>
                      <span>
                        <IdentityBadge member={member} />
                      </span>
                    </HtmlToolTipRaw>
                  ))
                }
              </Stack>
            ))
          }
          {
            hasMore &&
            <Link style={{marginLeft: '5px', fontSize: '16px'}} to={`${org.url}members`}>View All</Link>
          }
        </React.Fragment>
      }
    </div>
  )
}

export default Members;
