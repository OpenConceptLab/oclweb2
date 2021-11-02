import React from 'react';
import { isEmpty, groupBy, map, orderBy, reject } from 'lodash';
import {
  Paper, IconButton, Popper, Grow, ClickAwayListener, Tooltip,
  List, ListItem, ListItemIcon, ListItemText,
  ListSubheader, CircularProgress, ListItemButton
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import APIService from '../../services/APIService';
import { getCurrentUserUsername, defaultDeletePin,  } from '../../common/utils'
import PinIcon from '../common/PinIcon';
import DynamicConfigResourceIcon from '../common/DynamicConfigResourceIcon';

const Favorites = () => {
  const username = getCurrentUserUsername()
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [objects, setObjects] = React.useState({});
  const anchorRef = React.useRef(null);
  const handleToggle = () => setOpen(prevOpen => {
    const newOpen = !prevOpen
    if(newOpen)
      fetchFavorites()
    return newOpen
  });

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    setOpen(false);
  };

  const fetchFavorites = reload => {
    if(username && (isEmpty(objects) || reload)) {
      setLoading(true)
      __fetchFavorites()
    }
  }

  const __fetchFavorites = () => {
    getService()
      .get(null, null, {includeCreatorPins: true})
      .then(
        response => {
          setObjects(response.data)
          setLoading(false)
        })
  }

  const removePin = pinId => defaultDeletePin(getService(pinId), setObjects(reject(objects, {id: pinId})))

  const getService = pinId => APIService.users(username).pins(pinId)

  const getLabel = object => {
    if(object.owner)
      return `${object.owner}/${object.short_code}`
    return `${object.name}`
  }

  const groupedObjects = groupBy(objects, 'resource.type')

  return (
    <React.Fragment>
      <Tooltip arrow title='Favorites'>
        <IconButton
          ref={anchorRef}
          aria-controls={open ? 'favorite-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          touch='true'
          size="large"
          color={open ? 'primary' : 'default'}
        >
          <PinIcon pinned="true" />
        </IconButton>
      </Tooltip>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 1}}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
            >
            <Paper style={{minWidth: '330px', border: '1px solid lightgray'}}>
              <ClickAwayListener onClickAway={handleClose}>
                <div>
                  {
                    loading ?
                    <div className='flex-vertical-center' style={{height: '200px', width: '100%', justifyContent: 'center'}}>
                      <CircularProgress />
                    </div> :
                    <React.Fragment>
                      <div style={{width: '100%', padding: '5px 10px', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.1)', marginBottom: '5px'}} className='flex-vertical-center'>
                        <span style={{textAlign: 'left'}}>
                          <b>Favorites</b>
                        </span>
                        <span style={{textAlign: 'right'}}>
                          <IconButton color='primary' size='small' onClick={() => fetchFavorites(true)}>
                            <RefreshIcon fontSize='inherit' />
                          </IconButton>
                        </span>
                      </div>
                      {
                        isEmpty(groupedObjects) &&
                        <List dense style={{textAlign: 'left'}} subheader={
                          <ListSubheader style={{lineHeight: '24px', padding: '0 10px', fontSize: '0.8rem'}} component="div" id="nested-list-subheader">
                            Pin resources <a href={`#/users/${username}/`}>here</a>
                          </ListSubheader>
                        }/>
                      }
                        {
                          map(groupedObjects, (resources, type) => {
                            return (
                              <List dense style={{textAlign: 'left'}} key={type} subheader={
                                <ListSubheader style={{lineHeight: '24px', padding: '0 10px', fontSize: '0.8rem'}} component="div" id="nested-list-subheader">
                                  {`${type}s`}
                                </ListSubheader>
                              }>
                                {
                                  map(orderBy(resources, ['created_at', 'resource.name'], ['desc', 'asc']), resource => (
                                    <ListItem disablePadding key={resource.id} secondaryAction={
                                      <Tooltip title='Remove'>
                                        <IconButton edge="end" aria-label="pin" size='small' onClick={() => removePin(resource.id)}>
                                          <PinIcon pinned="true" fontSize='inherit' />
                                        </IconButton>
                                      </Tooltip>
                                    }>
                                      <ListItemButton role={undefined} href={`#${resource.resource_uri}`} dense component="a" style={{padding: '0 15px'}}>
                                        <ListItemIcon style={{minWidth: 'auto', marginRight: '5px'}}>
                                          <DynamicConfigResourceIcon
                                            resource={type.toLowerCase()}
                                            fontSize='inherit'
                                            enableColor
                                          />
                                        </ListItemIcon>
                                        <ListItemText primary={getLabel(resource.resource)} />
                                      </ListItemButton>
                                    </ListItem>
                                  ))
                                }
                              </List>
                            )
                          })
                        }
                    </React.Fragment>
                  }
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default Favorites;
