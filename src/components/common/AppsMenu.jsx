import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router';
import { Apps as AppsIcon , Web as MetadataBrowserIcon, Publish as ImportsIcon } from '@mui/icons-material';
import { Tooltip, IconButton, Box, Typography } from '@mui/material';
import useToggle from '../../hooks/useToggle';
import OpenMRSLogo from '../common/OpenMRSLogo';
import { getOpenMRSURL, getSiteTitle } from '../../common/utils';
import PopperGrow from './PopperGrow';

const SITE_TITLE = getSiteTitle()
const AppsMenu = props => {
  const { noOpenMRS } = props;
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
        <div className='app-menu' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Box className="app-container" display="flex" justifyContent="space-around">
            <Link to="/" className='no-anchor-styles flex-vertical-center'>
              <Box className={location.pathname !== "/imports" ? "app selected" : "app"} display="flex" flexDirection="column" alignItems="center">
                <MetadataBrowserIcon fontSize="large"/>
                <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                  {SITE_TITLE} <br/> TermBrowser
                </Typography>
              </Box>
            </Link>
            {
              !noOpenMRS &&
              <a href={getOpenMRSURL()} className='no-anchor-styles flex-vertical-center'>
                <Box className="app" display="flex" flexDirection="column" alignItems="center">
                  <OpenMRSLogo style={{width:"30px"}} />
                  <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                    OpenMRS <br/> Dictionary <br/> Manager
                  </Typography>
                </Box>
              </a>
            }
            <Link to='/imports' className='no-anchor-styles flex-vertical-center' onClick={handleClose}>
              <Box className={location.pathname == "/imports" ? "app selected" : "app"} display="flex" flexDirection="column" alignItems="center">
                <ImportsIcon fontSize="large"/>
                <Typography style={{lineHeight:"1.2", marginTop:"15px"}} align="center" component="h6">
                  Bulk <br/> Importer
                </Typography>
              </Box>
            </Link>
          </Box>
        </div>
      </PopperGrow>
    </React.Fragment>
  );
}

export default AppsMenu;
