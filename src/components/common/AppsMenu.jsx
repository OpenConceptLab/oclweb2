import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { Apps as AppsIcon , Web as MetadataBrowserIcon, Publish as ImportsIcon } from '@mui/icons-material';
import { Tooltip, IconButton, Box, Typography } from '@mui/material';
import useToggle from '../../hooks/useToggle';
import { getSiteTitle } from '../../common/utils';
import PopperGrow from './PopperGrow';

const SITE_TITLE = getSiteTitle()
const AppsMenu = props => {
  const { hideTermBrowserApp, hideImportApp } = props;
  const open = useToggle()
  const location = useLocation()
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    open.setFalse()
  };
  const anchorRef = React.useRef(null);

  return (
    <React.Fragment>
      <Tooltip arrow title="Apps menu">
        <IconButton
          className={open.value ? "app-menu-toggle selected" : "app-menu-toggle"}
          style={{marginRight:"5px"}}
          touch='true'
          onClick={open.toggle}
          ref={anchorRef}
          size="large"
          color={open.value ? 'primary' : 'default'}
        >
          <AppsIcon/>
        </IconButton>
      </Tooltip>
      <PopperGrow open={open.value} anchorRef={anchorRef} handleClose={handleClose}>
        <div className='app-menu'>
          <Box className="app-container" display="inline-block" justifyContent="space-around" style={{width: '100%'}}>
            {
              !hideTermBrowserApp &&
              <Link to="/" className='no-anchor-styles'>
                <Box className={location.pathname !== "/imports" ? "app selected" : "app"} display="inline-block">
                  <MetadataBrowserIcon fontSize="large"/>
                  <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                    {SITE_TITLE} <br/> TermBrowser
                  </Typography>
                </Box>
              </Link>
            }
            {
              !hideImportApp &&
              <Link to='/imports' className='no-anchor-styles' onClick={handleClose}>
                <Box className={location.pathname == "/imports" ? "app selected" : "app"} display="inline-block">
                  <ImportsIcon fontSize="large"/>
                  <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                    Bulk <br/> Importer
                  </Typography>
                </Box>
              </Link>
            }
          </Box>
        </div>
      </PopperGrow>
    </React.Fragment>
  );
}

export default AppsMenu;
