import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Paper, Popper, Grow, ClickAwayListener, Collapse, Button } from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { map, isEmpty, get } from 'lodash';
import {
  isLoggedIn, isServerSwitched, canSwitchServer, getAppliedServerConfig, getEnv,
  getSiteTitle, getLoginURL
} from '../../common/utils';
import { WHITE, BLACK } from '../../common/constants';
import SearchInput from '../search/SearchInput';
import SearchByAttributeInput from '../search/SearchByAttributeInput';
import UserOptions from '../users/UserOptions';
import Favorites from './Favorites';
import RecentHistory from './RecentHistory';
import { OPTIONS, SITE_URL } from './MenuOptions.jsx';
/* import Feedback from '../common/Feedback'; */
import AppsMenu from '../common/AppsMenu';
import ServerConfigsChip from '../common/ServerConfigsChip';

const drawerWidth = 250;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(() => ({
  backgroundColor: WHITE,
  color: BLACK,
  borderLeft: 'none',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: 'none',
  zIndex: 1300,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);


const NestedMenuContainer = ({ open, toggleState, anchorRef, handleClose, toggleFunc, children}) => {
  return open ?
    <Collapse in={toggleState} timeout="auto" unmountOnExit>
      {children}
    </Collapse> :
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
          <ClickAwayListener onClickAway={event => handleClose(event, anchorRef, toggleFunc)}>

            {children}
          </ClickAwayListener>
        </Paper>
      </Grow>
    )}
  </Popper>
}

const Header = props => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const communityAnchorRef = React.useRef(null);
  const toolsAnchorRef = React.useRef(null);
  const authenticated = isLoggedIn()

  const [nestedCommunity, setNestedCommunity] = React.useState(false);
  const [nestedTools, setNestedTools] = React.useState(false);
  const handleDrawerClose = () => setOpen(false)
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
  const hideLeftNav = get(siteConfiguration, 'noLeftMenu', false)
  const hideTermBrowserApp = get(siteConfiguration, 'hideTermBrowserApp', false)
  const hideImportApp = get(siteConfiguration, 'hideImportApp', false)
  const hideAppsMenu = hideImportApp && hideTermBrowserApp;
  const getLogo = () => {
    let logo = getSiteTitle()
    if(get(siteConfiguration, 'logoText'))
      logo = siteConfiguration.logoText
    if(get(siteConfiguration, 'logoURL'))
      logo = (<img src={siteConfiguration.logoURL} style={{width: '50px', height: '50px', marginTop: '-10px'}} />);
    return logo
  }


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {
            !hideLeftNav &&
              <IconButton
                color="primary"
                aria-label="open drawer"
                onClick={toggleOpen}
                edge="start"
                sx={{
                  marginRight: '16px',
                }}
              >
                <MenuIcon />
              </IconButton>
          }
          <Typography variant="h6" className="brand col-sm-1" style={{padding: '0 5px'}}>
            <a className="no-anchor-styles" href={isProduction ? SITE_URL : '/'} rel="noopener noreferrer">
              {getLogo()}
            </a>
          </Typography>
          <div className="col-sm-8 col-xs-6">
            {
              props.fhir ?
                <SearchByAttributeInput {...props} /> :
              <SearchInput {...props} />
            }
          </div>
          <div className='col-sm-4 col-xs-6 pull-right no-side-padding'style={{textAlign: 'right'}}>
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
                        hideTermBrowserApp={hideTermBrowserApp}
                        hideImportApp={hideImportApp}
                      />
                  }
                  <UserOptions />
                </span> :
              (
                !isFHIRServer &&
                  <span style={{marginLeft: '20px'}}>
                    <Button className='primary-btn' href={getLoginURL()} color='primary' variant='contained'>
                      Sign In
                    </Button>
                  </span>
              )
            }
          </div>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {
            map(OPTIONS, option => {
              const { href, label, nested, selected, icon } = option;
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
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      className='btn'
                      component="a"
                      target='_blank'
                      selected={selected}
                      href={!hasNested ? href : undefined}
                      onClick={hasNested ? toggleFunc : undefined}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                      }}
                      ref={anchorRef}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={label} sx={{ opacity: open ? 1 : 0 }} />
                      {
                        hasNested && open && (
                          toggleState ?
                            <ExpandLessIcon /> :
                            <ExpandMoreIcon />
                        )
                      }
                    </ListItemButton>
                  </ListItem>
                  {
                    (open ? hasNested : (anchorRef && toggleState)) &&
                      <NestedMenuContainer open={open} toggleState={toggleState} toggleFunc={toggleFunc} anchorRef={anchorRef} handleClose={event => handleCloseNested(event, anchorRef, toggleFunc)}>
                        <List component="div" disablePadding>
                          {
                            nested.map(nestedOption => (
                              <ListItemButton
                                className='btn'
                                component="a"
                                target='_blank'
                                key={nestedOption.label}
                                href={nestedOption.href}
                                sx={{
                                  minHeight: 48,
                                  pl: 4,
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 0,
                                    mr: 3,
                                    justifyContent: 'center',
                                  }}
                                >
                                  {nestedOption.icon}
                                </ListItemIcon>
                                <ListItemText primary={nestedOption.label} secondary={nestedOption.deprecated ? 'deprecated' : undefined} style={nestedOption.deprecated ? {fontStyle: 'italic'} : {}} />
                              </ListItemButton>
                            ))
                          }
                        </List>
                      </NestedMenuContainer>
                  }

                </React.Fragment>
              )
            }
               )}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <DrawerHeader />
        { props.children }
      </Box>
    </Box>
  );
}


export default Header;
