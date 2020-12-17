import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardHeader, CardContent, CardActions, IconButton, Chip, Avatar, Typography,
  CircularProgress,
} from '@material-ui/core';
import {
  List as ListIcon, Loyalty as LoyaltyIcon, Home as HomeIcon,
  Delete as DeleteIcon, LocalOffer as LocalOfferIcon, Link as LinkIcon,
  AccountTreeRounded as TreeIcon
} from '@material-ui/icons';
import { isEmpty, get, last, compact } from 'lodash';
import { ORANGE, GREEN } from '../../common/constants';

const getIcon = resourceURI => {
  if(resourceURI.indexOf('/sources/') >= 0)
    return <ListIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/collections/') >= 0)
    return <LoyaltyIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/orgs/') >= 0)
    return <HomeIcon size='small' style={{color: ORANGE, width: '20px', marginRight: '0px'}} />;
}

const Pin = ({ pin, canDelete, onDelete }) => {
  const mnemonic = last(compact(pin.resource_uri.split('/')))
  const isOrg = pin.resource_uri.indexOf('/sources/') === -1 && pin.resource_uri.indexOf('/collections/') === -1;
  return (
      <Card style={{height: '150px', position: 'relative', boxShadow: 'none', border: '1px solid lightgray', width: '100%', display: 'inline-block'}}>
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
                  <IconButton size='small' onClick={() => onDelete(pin.id)}>
                    <DeleteIcon fontSize='small' style={{width: '20px'}}/>
                  </IconButton>
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
            </React.Fragment> :
            <React.Fragment>
              <Link to={pin.resource.concepts_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={get(pin, 'resource.active_concepts', '0').toLocaleString()}
                  icon={<LocalOfferIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
              <Link to={pin.resource.mappings_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={get(pin, 'resource.active_mappings', '0').toLocaleString()}
                  icon={<LinkIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
              <Link to={pin.resource.versions_url}>
                <Chip
                  color='primary'
                  className='clickable'
                  variant='outlined'
                  size='small'
                  label={get(pin, 'resource.versions', '0').toLocaleString()}
                  icon={<TreeIcon fontSize='small' style={{width: '14px'}} />}
                  style={{border: 'none', margin: '0 5px', padding: '5px'}}
                />
              </Link>
            </React.Fragment>
          }
        </CardActions>
      </Card>
  )
}

export default Pin;
