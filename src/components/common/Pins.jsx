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
import { map, isEmpty, get, last, compact, orderBy } from 'lodash';
import { ORANGE, GREEN } from '../../common/constants';
import PinIcon from '../common/PinIcon';

const getIcon = resourceURI => {
  if(resourceURI.indexOf('/sources/') >= 0)
    return <ListIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/collections/') >= 0)
    return <LoyaltyIcon size='small' style={{color: GREEN, width: '20px', marginRight: '0px'}} />;
  if(resourceURI.indexOf('/orgs/') >= 0)
    return <HomeIcon size='small' style={{color: ORANGE, width: '20px', marginRight: '0px'}} />;
}

const getGridDivision = pinsCount => {
  let division = 12;
  if(pinsCount < 3)
    return 6
  return Math.floor(division/pinsCount);
}

const Pins = ({ pins, onDelete, canDelete }) => {
  let gridDivision = getGridDivision(pins.length);
  const gridClassName = `col-md-${gridDivision}`
  return (
    <div className='col-md-12' style={{marginBottom: '10px'}}>
      {
        !isEmpty(pins) &&
        <h3 style={{margin: '10px 5px', display: 'flex', alignItems: 'center'}}>
          <PinIcon pinned="true" fontSize='small' style={{marginRight: '5px'}} />
          Pinned
        </h3>
      }
      {
        map(orderBy(pins, 'id'), pin => {
          const mnemonic = last(compact(pin.resource_uri.split('/')))
          const isOrg = pin.resource_uri.indexOf('/sources/') === -1 && pin.resource_uri.indexOf('/collections/') === -1;
          return (
            <div key={pin.id} className={gridClassName} style={{padding: '0 5px', height: '150px'}}>
              <Card style={{height: '150px', position: 'relative', boxShadow: 'none', border: '1px solid lightgray'}}>
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
            </div>
          )
        })
      }
    </div>
  );
}

export default Pins;
