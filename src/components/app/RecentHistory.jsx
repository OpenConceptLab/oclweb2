import React from 'react';
import { isEmpty, map } from 'lodash';
import {
  IconButton, Tooltip,
  List, ListItem, ListItemIcon, ListItemText,
  ListSubheader, ListItemButton
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import DynamicConfigResourceIcon from '../common/DynamicConfigResourceIcon';
import PopperGrow from '../common/PopperGrow';

const RecentHistory = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const handleToggle = () => setOpen(!open);

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;
    setOpen(false);
  };
  const visits = JSON.parse(localStorage.getItem('visits') || '[]')
  return (
    <React.Fragment>
      <Tooltip arrow title='Recent History'>
        <IconButton
          ref={anchorRef}
          aria-controls={open ? 'history-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          touch='true'
          size="large"
          color={open ? 'primary' : 'default'}
        >
          <HistoryIcon />
        </IconButton>
      </Tooltip>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose}>
        <div>
          <div style={{width: '100%', padding: '5px 10px', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.1)'}} className='flex-vertical-center'>
            <span style={{textAlign: 'left'}}>
              <b>Recent</b> (showing last 10)
            </span>
          </div>
          {
            isEmpty(visits) &&
            <List dense style={{textAlign: 'left', paddingTop: '0px', paddingBottom: '0px'}} subheader={
              <ListSubheader style={{lineHeight: '24px', padding: '0 10px', fontSize: '0.8rem'}} component="div" id="nested-list-subheader">
                Nothing here so far.
              </ListSubheader>
            }/>
          }
          <List dense style={{paddingTop: '0px', paddingBottom: '0px', textAlign: 'left', display: isEmpty(visits) ? 'none' : 'initial'}}>
            {
              map(visits, (visit, i) => {
                return (
                  <ListItem disablePadding key={i}>
                    <ListItemButton role={undefined} href={`#${visit.location.pathname + visit.location.search}`} dense component="a" style={{padding: '0 15px'}}>
                      <ListItemIcon style={{minWidth: 'auto', marginRight: '10px'}}>
                        <DynamicConfigResourceIcon
                          resource={visit.category.toLowerCase()}
                          fontSize='inherit'
                          enableColor
                        />
                      </ListItemIcon>
                      <ListItemText primary={visit.name.replaceAll('- OCL', '')} />
                    </ListItemButton>
                  </ListItem>
                )
              })
            }
          </List>
        </div>
      </PopperGrow>
    </React.Fragment>
  )
}

export default RecentHistory;
