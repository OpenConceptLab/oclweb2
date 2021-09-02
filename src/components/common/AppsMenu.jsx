import React from 'react';
import { useLocation, useHistory } from 'react-router';
import { Apps as AppsIcon , Web as MetadataBrowserIcon, Publish as ImportsIcon } from '@material-ui/icons';
import { Popper, ClickAwayListener, Tooltip, Grow, Paper, IconButton, Box, Typography } from '@material-ui/core';
import useToggle from '../../hooks/useToggle';
import OpenMRSLogo from '../common/OpenMRSLogo';
import { getOpenMRSURL } from '../../common/utils';

const AppsMenu = () => {
  const open = useToggle()
  const location = useLocation()
  const history = useHistory()
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    open.setFalse()
  };
  const anchorRef = React.useRef(null);
  const onTermBrowserClick = event => {
    event.persist();
    handleClose(event);
    history.push('/')
  };
  const onOpenMRSClick = event => {
    event.persist();
    handleClose(event);
    window.location = getOpenMRSURL()
  };
  const onImportsClick = event => {
    event.persist();
    handleClose(event);
    history.push('/imports')
  };

  return (
    <React.Fragment>
      <Tooltip arrow title="Apps menu">
        <IconButton className={open.value ? "app-menu-toggle selected" : "app-menu-toggle"} style={{marginRight:"5px"}} touch='true' onClick={open.toggle} ref={anchorRef}>
          <AppsIcon/>
        </IconButton>
      </Tooltip>
      <Popper placement='bottom-end' open={open.value} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 1}}>
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:'right top',
            }}
          >
            <Paper className="app-menu flex-vertical-center">
              <ClickAwayListener onClickAway={handleClose}>
                <Box className="app-container" display="flex" justifyContent="space-around">
                  <Box className={location.pathname !== "/imports" ? "app selected" : "app"} onClick={onTermBrowserClick} display="flex" flexDirection="column" alignItems="center">
                    <MetadataBrowserIcon fontSize="large"/>
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      OCL <br/> TermBrowser
                    </Typography>
                  </Box>
                  <Box className="app" onClick={onOpenMRSClick} display="flex" flexDirection="column" alignItems="center">
                    <OpenMRSLogo style={{width:"30px"}} />
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      OpenMRS <br/> Dictionary <br/> Manager
                    </Typography>
                  </Box>
                  <Box className={location.pathname == "/imports" ? "app selected" : "app"} onClick={onImportsClick} display="flex" flexDirection="column" alignItems="center">
                    <ImportsIcon fontSize="large"/>
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      Bulk <br/> Importer
                    </Typography>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}

export default AppsMenu;
