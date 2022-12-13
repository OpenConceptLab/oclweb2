import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardHeader, CardContent, CardActions, IconButton, Chip, Avatar, Typography,
  CircularProgress, Tooltip
} from '@mui/material';
import {
  List as ListIcon, Loyalty as LoyaltyIcon, AccountBalance as HomeIcon,
  LocalOffer as LocalOfferIcon, Link as LinkIcon,
  AccountTreeRounded as TreeIcon,
  AspectRatio as ExpansionIcon
} from '@mui/icons-material';
import { isEmpty, get, last, compact } from 'lodash';
import { ORANGE, GREEN } from '../../common/constants';
import PinIcon from './PinIcon';

const getIcon = resourceURI => {
  if(resourceURI.indexOf('/sources/') >= 0)
    return <ListIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/collections/') >= 0)
    return <LoyaltyIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/orgs/') >= 0)
    return <HomeIcon size='small' style={{color: ORANGE, width: '20px', marginRight: '0px'}} />;
}

const localizeCount = count => {
  if(count === null)
    return '-'

  return count.toLocaleString()
}

const Pin = ({ pin, canDelete, onDelete, style }) => {
  const mnemonic = last(compact(pin.resource_uri.split('/')))
  const isOrg = pin.resource_uri.indexOf('/sources/') === -1 && pin.resource_uri.indexOf('/collections/') === -1;
  const isCollection = pin.resource_uri.indexOf('/collections/') >= 0
  return (
    <Card style={{height: '150px', position: 'relative', boxShadow: 'none', border: '1px solid lightgray', width: '100%', display: 'inline-block', ...style}}>
      <CardHeader
        style={{padding: '5px'}}
        classes={{avatar: 'pinned-item-icon', action: 'pinned-item-action'}}
        avatar={
          <Avatar style={{background: 'none', width: '30px', height: '30px'}}>
            {getIcon(pin.resource_uri)}
          </Avatar>
        }
        action={
          canDelete &&
            <Tooltip arrow title='Remove Pin'>
              <IconButton size='small' onClick={() => onDelete(pin.id)}>
                <PinIcon pinned='true' fontSize='small' style={{width: '20px'}}/>
              </IconButton>
            </Tooltip>
        }
        title={<Link to={pin.resource_uri}>{mnemonic}</Link>}
      />
      <CardContent>
        {
          isEmpty(pin.resource) ?
            <div style={{textAlign: 'center'}}>
              <CircularProgress color='primary' />
            </div> :
          <Typography variant="body2" color="textSecondary" component="p" className='ellipsis-text-2'>
            {pin.resource.description || pin.resource.full_name || pin.resource.name}
          </Typography>
        }
      </CardContent>
      <CardActions disableSpacing style={{position: 'absolute', bottom: '0', width: '100%'}}>
        {
          isOrg ?
            <React.Fragment>
              <Tooltip title="Sources">
                <Link to={pin.resource.collections_url}>
                  <Chip
                    color='primary'
                    className='clickable'
                    variant='outlined'
                    size='small'
                    label={get(pin, 'resource.public_sources', '0').toLocaleString()}
                    icon={<ListIcon fontSize='small' style={{width: '14px'}} />}
                    style={{border: 'none', margin: '0 5px', padding: '5px'}}
                  />
                </Link>
              </Tooltip>
              <Tooltip title="Collections">
                <Link to={pin.resource.collections_url}>
                  <Chip
                    color='primary'
                    className='clickable'
                    variant='outlined'
                    size='small'
                    label={get(pin, 'resource.public_collections', '0').toLocaleString()}
                    icon={<LoyaltyIcon fontSize='small' style={{width: '14px'}} />}
                    style={{border: 'none', margin: '0 5px', padding: '5px'}}
                  />
                </Link>
              </Tooltip>
            </React.Fragment> :
          <React.Fragment>
            <Tooltip title='Concepts'>
              <Link to={pin.resource.concepts_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={localizeCount(get(pin, 'resource.summary.active_concepts', null))}
                  icon={<LocalOfferIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
            </Tooltip>
            <Tooltip title='Mappings'>
              <Link to={pin.resource.mappings_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={localizeCount(get(pin, 'resource.summary.active_mappings', null))}
                  icon={<LinkIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
            </Tooltip>
            <Tooltip title='Versions'>
              <Link to={pin.resource.versions_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={get(pin, 'resource.summary.versions', '0').toLocaleString()}
                  icon={<TreeIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
            </Tooltip>
            {
              isCollection &&
                <React.Fragment>
                  <Tooltip title='References'>
                    <Link to={pin.resource.url + 'references/'}>
                      <Chip
                        color='primary'
                        className='clickable'
                        variant='outlined'
                        size='small'
                        label={get(pin, 'resource.summary.active_references', '0').toLocaleString()}
                        icon={<i className="icon-link" style={{ fontSize: 'small', width: '14px' }} />}
                        style={{border: 'none', margin: '0 5px', padding: '5px'}}
                      />
                    </Link>
                  </Tooltip>
                  <Tooltip title='Expansions'>
                    <Link to={pin.resource.versions_url}>
                      <Chip
                        color='primary'
                        className='clickable'
                        variant='outlined'
                        size='small'
                        label={get(pin, 'resource.summary.expansions', '0').toLocaleString()}
                        icon={<ExpansionIcon fontSize='small' style={{width: '14px'}} />}
                        style={{border: 'none', margin: '0 5px', padding: '5px'}}
                      />
                    </Link>
                  </Tooltip>
                </React.Fragment>
            }
          </React.Fragment>
        }
      </CardActions>
    </Card>
  )
}

export default Pin;
