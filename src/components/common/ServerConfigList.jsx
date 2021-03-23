import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  List, ListItem, ListItemIcon, ListItemText
} from '@material-ui/core';
import {
  Check as CheckIcon
} from '@material-ui/icons';
import { get, map } from 'lodash';
import { SERVER_CONFIGS } from '../../common/serverConfigs';
import { getAppliedServerConfig, isServerSwitched } from '../../common/utils';

const ServerConfigList = () => {
  const selectedConfig = getAppliedServerConfig();

  const onChange = (event, config) => {
    event.preventDefault();
    event.stopPropagation();

    localStorage.setItem('server', JSON.stringify(config));

    if(!isServerSwitched())
      localStorage.removeItem('server')

    alertifyjs.success('Switching Server! This might take few seconds...', 2, () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/'
      window.location.reload()
    })
  }

  return (
    <List component="div" disablePadding>
      {
        map(SERVER_CONFIGS, config => {
          const selected = get(selectedConfig, 'url') === config.url;
          return (
            <ListItem disabled={config.disabled} selected={selected} className='btn' button key={config.id} onClick={event => onChange(event, config)} style={{cursor: config.disabled ? 'not-allowed' : 'pointer'}}>
              <ListItemIcon style={{minWidth: 'auto', marginRight: '15px', width: '22px', height: '22px'}}>
                <img src={config.type === 'ocl' ? '/favicon.ico' : '/fhir.svg'} />
              </ListItemIcon>
              <ListItemText primary={config.name} secondary={config.url}/>
              {selected && <CheckIcon />}
            </ListItem>
          )
        })
      }
    </List>
  )
}

export default ServerConfigList;
