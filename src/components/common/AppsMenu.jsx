import React from 'react';
import { Apps as AppsIcon , Web as MetadataBrowserIcon, Publish as ImportsIcon } from '@material-ui/icons';
import { Popper, ClickAwayListener, Tooltip, Grow, Paper, IconButton, Box, Typography } from '@material-ui/core';
import useToggle from '../../hooks/useToggle';
import OpenMRSLogo from '../common/OpenMRSLogo';
import { useLocation, useHistory } from 'react-router';
import { BLUE, OPENMRS_URL } from '../../common/constants';

const AppsMenu = () => {
  const open = useToggle()
  const location = useLocation()
  const histroy = useHistory()
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    open.setFalse()
  };
  const anchorRef = React.useRef(null);
  const onTermBrowserClick = event => {
    event.persist();
    handleClose(event);
    histroy.push('/')
  };
  const onOpenMRSClick = event => {
    event.persist();
    handleClose(event);
    window.location = OPENMRS_URL
  };
  const onImportsClick = event => {
    event.persist();
    handleClose(event);
    histroy.push('/imports')
  };

  return (
    <React.Fragment>
        <Tooltip arrow title="Apps menu">
          <IconButton style={{marginRight:"5px"}} touch='true' onClick={open.toggle} ref={anchorRef}>
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
            <Paper style={{minWidth: '400px', minHeight: '150px' , border: '1px solid lightgray'}}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box py={5} display="flex" justifyContent="space-around" >
                  <Box onClick={onTermBrowserClick} style={{cursor:"pointer"}} display="flex" flexDirection="column" alignItems="center">
                    <MetadataBrowserIcon fontSize="large"/>
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      OCL <br/> TermBrowser
                    </Typography>
                    { location.pathname !== "/imports" && <Box marginTop="10px" width="10px" height="10px" style={{background:BLUE}} borderRadius="50%"></Box>}
                  </Box>
                  <Box onClick={onOpenMRSClick} style={{cursor:"pointer"}} display="flex" flexDirection="column" alignItems="center">
                    <OpenMRSLogo style={{width:"30px"}} />
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      OpenMRS <br/> Dictionary <br/> Manager
                    </Typography>
                  </Box>
                  <Box onClick={onImportsClick} style={{cursor:"pointer"}} display="flex" flexDirection="column" alignItems="center">
                    <ImportsIcon fontSize="large"/>
                    <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                      Bulk <br/> Importer
                    </Typography>
                    { location.pathname === "/imports" && <Box marginTop="10px" width="10px" height="10px" style={{background:BLUE}} borderRadius="50%"></Box>}
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
