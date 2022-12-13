import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Check as CheckIcon
} from '@mui/icons-material';
import { get, map } from 'lodash';
import {
  getAppliedServerConfig, getDefaultServerConfig,  isServerSwitched, getServerConfigsForCurrentUser
} from '../../common/utils';

const ServerConfigList = ({ onClose }) => {
  const selectedConfig = getAppliedServerConfig();
  const defaultConfig = getDefaultServerConfig();
  const eligibleServerConfigs = getServerConfigsForCurrentUser()

  const onChange = (event, config) => {
    event.preventDefault();
    event.stopPropagation();
    if(selectedConfig?.id ? selectedConfig.id === config.id : selectedConfig?.url === config.url){
      onClose();
      return;
    }

    localStorage.setItem('server', JSON.stringify(config));

    if(!isServerSwitched())
      localStorage.removeItem('server')

    onClose();

    alertifyjs.success('Switching Server! This might take few seconds...', 2, () => {
      const isOCLServer = config.type === 'ocl';
      localStorage.setItem('server_configs', JSON.stringify(eligibleServerConfigs))
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = isOCLServer ? '#/' : '#/fhir'
      window.location.reload()
    })
  }

  return (
    <List component="div" disablePadding>
      {
        map(eligibleServerConfigs, config => {
          const selected = selectedConfig.id ? selectedConfig.id === config.id : get(selectedConfig, 'url') === config.url;
          const isDefault = defaultConfig.id ? defaultConfig.id === config.id : config.url === defaultConfig.url;
          return (
            <ListItem disabled={config.disabled} selected={selected} className='btn' button key={config.id} onClick={event => onChange(event, config)} style={{cursor: config.disabled ? 'not-allowed' : 'pointer'}}>
              <ListItemIcon style={{minWidth: 'auto', marginRight: '15px', width: '22px', height: '22px'}}>
                <img src={config.type === 'ocl' ? '/favicon.ico' : '/fhir.svg'} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span>
                    <span>{ config.name }</span>
                    {
                      isDefault &&
                      <span style={{fontStyle: 'italic', marginLeft: '5px'}}>
                        (default)
                      </span>
                    }
                  </span>
                }
                secondary={config.url}
              />
              { selected && <CheckIcon /> }
            </ListItem>
          )
        })
      }
    </List>
  )
}

export default ServerConfigList;
