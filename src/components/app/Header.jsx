import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Drawer, CssBaseline, List, IconButton,
  ListItem, ListItemText, Collapse, ListItemIcon, Tooltip, Paper,
  Popper, Grow, ClickAwayListener
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { map, isEmpty, get } from 'lodash';
import {
  isAtGlobalSearch, isLoggedIn, isServerSwitched, canSwitchServer, getAppliedServerConfig, getEnv,
  getSiteTitle
} from '../../common/utils';
import { WHITE, BLACK } from '../../common/constants';
import SearchInput from '../search/SearchInput';
import UserOptions from '../users/UserOptions';
import Favorites from './Favorites';
import RecentHistory from './RecentHistory';
import { OPTIONS, SITE_URL } from './MenuOptions.jsx';
/* import Feedback from '../common/Feedback'; */
import AppsMenu from '../common/AppsMenu';
import ServerConfigsChip from '../common/ServerConfigsChip';

const drawerWidth = 250;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 0,
  },
  hide: {
    display: 'none',
  },
  drawerContainer: {
    overflow: 'auto',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    height: '65px',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));


const Header = props => {
  const communityAnchorRef = React.useRef(null);
  const toolsAnchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const authenticated = isLoggedIn()
  const [nestedCommunity, setNestedCommunity] = React.useState(false);
  const [nestedTools, setNestedTools] = React.useState(false);
  const toggleNestedCommunity = () => {
    const value = !nestedCommunity
    if(value)
      setNestedTools(false)
    setNestedCommunity(value)
  };

  const toggleNestedTools = () => {
    const value = !nestedTools
    if(value)
      setNestedCommunity(false)
    setNestedTools(value)
  };

  const handleCloseNested = (event, anchorRef, toggleFunc) => {
    if (anchorRef.current && anchorRef.current.contains(event.target))
      return;

    toggleFunc();
  };

  const toggleOpen = () => setOpen(prevOpen => {
    const newOpen = !prevOpen
    props.onOpen(newOpen)
    setTimeout(() => window.dispatchEvent(new CustomEvent("resize")), 300)
    if(!newOpen) {
      setNestedTools(false)
      setNestedCommunity(false)
    }
    return newOpen
  })

  const serverConfig = getAppliedServerConfig()
  const siteConfiguration = get(serverConfig, 'info.site')
  const isFHIRServer = get(serverConfig, 'type') === 'fhir';
  const env = getEnv()
  const isProduction = env === 'production';

  const getLogo = () => {
    let logo = getSiteTitle()
    if(get(siteConfiguration, 'logoText'))
      logo = siteConfiguration.logoText
    if(get(siteConfiguration, 'logoURL'))
      logo = (<img src={siteConfiguration.logoURL} style={{width: '50px', height: '50px', marginTop: '-10px'}} />);
    return logo
  }

  const hideLeftNav = get(siteConfiguration, 'noLeftMenu', false)

  const hideOpenMRSApp = get(siteConfiguration, 'hideOpenMRSApp', false)
  const hideTermBrowserApp = get(siteConfiguration, 'hideTermBrowserApp', false)
  const hideImportApp = get(siteConfiguration, 'hideImportApp', false)
  const hideAppsMenu = hideOpenMRSApp && hideImportApp && hideTermBrowserApp;
  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar
        position="fixed"
        style={{
          backgroundColor: WHITE,
          color: BLACK,
          borderLeft: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: 'none'
        }}
        className={classes.appBar}
      >
        <Toolbar style={{padding: '0 15px'}}>
          {
            !hideLeftNav &&
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={toggleOpen}
              edge="start"
              className={classes.menuButton}
              size="large">
              <MenuIcon />
            </IconButton>
          }
          <Typography variant="h6" className="brand col-sm-1" style={{padding: '0 5px'}}>
            <a className="no-anchor-styles" href={isProduction ? SITE_URL : '/'} rel="noopener noreferrer">
              {getLogo()}
            </a>
          </Typography>
          <div className="col-sm-8">
            {
              !isAtGlobalSearch() &&
              <SearchInput {...props} />
            }
          </div>
          <div className='col-sm-4 pull-right no-side-padding'style={{textAlign: 'right'}}>
            {
              canSwitchServer() && isServerSwitched() &&
              <ServerConfigsChip />
            }
            {
              authenticated ?
              <span style={{marginLeft: '20px'}}>
                <RecentHistory />
                <Favorites />
                {
                  !hideAppsMenu &&
                  <AppsMenu
                    hideOpenMRSApp={hideOpenMRSApp}
                    hideTermBrowserApp={hideTermBrowserApp}
                    hideImportApp={hideImportApp}
                  />
                }
                <UserOptions />
              </span> :
              (
                !isFHIRServer &&
                <span style={{marginLeft: '20px'}}>
                  <Button className='primary-btn' href="/#/accounts/login" color='primary' variant='contained'>
                    Sign In
                  </Button>
                </span>
              )
            }
          </div>
        </Toolbar>
      </AppBar>
      {
        open ?
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open
          classes={{
            paper: classes.drawerPaper,
          }}
          style={hideLeftNav ? {display: 'none'} : {}}
          >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              {
                map(OPTIONS, option => {
                  const { href, label, nested, selected, icon } = option;
                  const hasNested = !isEmpty(nested);
                  const isCommunity = label === 'Community';
                  const toggleFunc = isCommunity ? toggleNestedCommunity : toggleNestedTools;
                  const toggleState = isCommunity ? nestedCommunity : nestedTools;
                  return (
                    <React.Fragment key={label}>
                      <ListItem
                        className='btn'
                        button
                        component="a"
                        target='_blank'
                        selected={selected}
                        href={!hasNested ? href : undefined}
                        onClick={hasNested ? toggleFunc : undefined}
                        style={selected ? {padding: '12px 16px', backgroundColor: 'rgba(51, 115, 170, 0.1)'} : {padding: '12px 16px'}}
                      >
                        <ListItemIcon style={{minWidth: '35px'}}>
                          {icon}
                        </ListItemIcon>
                        <ListItemText primary={label} />
                        {
                          hasNested && (
                            toggleState ?
                            <ExpandLessIcon /> :
                            <ExpandMoreIcon />
                          )
                        }
                      </ListItem>
                      {
                        hasNested &&
                        <Collapse in={toggleState} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {
                              nested.map(nestedOption => (
                                <ListItem
                                  className='btn'
                                  button
                                  component="a"
                                  target='_blank'
                                  key={nestedOption.label}
                                  href={nestedOption.href}
                                  style={{padding: '12px 16px 12px 30px'}}
                                  >
                                  <ListItemIcon style={{minWidth: '35px'}}>
                                    {nestedOption.icon}
                                  </ListItemIcon>
                                  <ListItemText primary={nestedOption.label} />
                                </ListItem>
                              ))
                            }
                          </List>
                        </Collapse>
                      }
                    </React.Fragment>
                  )
                })
              }
              {/* <Feedback mainButtonLabel='Feedback' containerClassName='feedback-div-open' /> */}
            </List>
          </div>
        </Drawer> :
        <Drawer
          id='left-menu-collapsed'
          style={{flexShrink: 0, width: 'auto', display: hideLeftNav ? 'none' : 'inherit'}}
          variant="permanent"
          anchor="left"
          open
          classes={{
            paper: 'menu-collapsed-paper'
          }}
          >
          <div className={classes.drawerHeader}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={toggleOpen}
              edge="start"
              className={open ? classes.menuButton + ' ' + classes.hide : classes.menuButton}
              style={{marginLeft: 0}}
              size="large">
              <MenuIcon />
            </IconButton>
          </div>
          <List>
            {
              map(OPTIONS, option => {
                const { href, label, selected, icon, nested, tooltip } = option;
                const hasNested = !isEmpty(nested);
                const isCommunity = label === 'Community';
                const isTools = label === 'Tools';
                const toggleFunc = isCommunity ? toggleNestedCommunity : toggleNestedTools;
                const toggleState = isCommunity ? nestedCommunity : nestedTools;
                let anchorRef;
                if(isCommunity)
                  anchorRef = communityAnchorRef
                if(isTools)
                  anchorRef = toolsAnchorRef

                return (
                  <React.Fragment key={label}>
                    <Tooltip arrow title={tooltip || label} placement='right'>
                      <ListItem
                        className='btn'
                        button
                        component="a"
                        target='_blank'
                        selected={selected}
                        href={hasNested ? undefined : href}
                        style={selected ? {padding: '16px 16px', backgroundColor: 'rgba(51, 115, 170, 0.1)'} : {padding: '16px 16px'}}
                        onClick={hasNested ? toggleFunc : undefined}
                        ref={anchorRef}
                      >
                        <ListItemIcon>
                          {icon}
                        </ListItemIcon>
                      </ListItem>
                    </Tooltip>
                    {
                      anchorRef && toggleState &&
                      <Popper
                        open={toggleState}
                        anchorEl={anchorRef.current}
                        transition
                        className='menu-popper-right'
                        placement='right'
                        >
                        {({ TransitionProps }) => (
                          <Grow {...TransitionProps}>
                            <Paper>
                              <ClickAwayListener onClickAway={event => handleCloseNested(event, anchorRef, toggleFunc)}>
                                <List>
                                  {
                                    nested.map(nestedOption => (
                                      <ListItem
                                        className='btn'
                                        button
                                        component="a"
                                        target='_blank'
                                        key={nestedOption.label}
                                        href={nestedOption.href}
                                        style={{padding: '12px'}}
                                        >
                                        <ListItemIcon style={{minWidth: '35px'}}>
                                          {nestedOption.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={nestedOption.label} />
                                      </ListItem>
                                    ))
                                  }
                                </List>
                              </ClickAwayListener>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    }
                  </React.Fragment>
                )
              })
            }
            {/* <Feedback mainButtonLabel={false} containerClassName='feedback-div' /> */}
          </List>
        </Drawer>

      }
    </React.Fragment>
  );
}

export default Header;
