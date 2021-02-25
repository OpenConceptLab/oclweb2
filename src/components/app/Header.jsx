import React from 'react';
import clsx from 'clsx';
import {
  AppBar, Toolbar, Typography, Button, Drawer, CssBaseline, List, Divider, IconButton,
  ListItem, ListItemText, Collapse
} from '@material-ui/core';
import {
  Person as PersonIcon,
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  Menu as MenuIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { map, isEmpty } from 'lodash';
import { isAtGlobalSearch, isLoggedIn, getCurrentUser } from '../../common/utils';
import { WHITE, BLACK } from '../../common/constants';
import SearchInput from '../search/SearchInput';
import UserOptions from '../users/UserOptions';
import { OPTIONS, MARKETING_SITE_URL } from './MenuOptions';

const drawerWidth = 300;
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    overflow: "auto",
    height: "auto",
    minHeight: '100%'
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
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
  const [open, setOpen] = React.useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);
  const classes = useStyles();
  const theme = useTheme();
  const authenticated = isLoggedIn()
  const user = getCurrentUser()
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

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar
        position="fixed"
        variant="outlined"
        style={{backgroundColor: WHITE, color: BLACK}}
        className={clsx(classes.appBar, {[classes.appBarShift]: open})}
      >
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            onClick={onOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="brand col-sm-1" style={{padding: '0 10px'}}>
            <a className="no-anchor-styles" href={MARKETING_SITE_URL} rel="noopener noreferrer">
              OCL
            </a>
          </Typography>
          <div className="col-sm-8">
            {
              !isAtGlobalSearch() &&
              <SearchInput {...props} />
            }
          </div>
          <div className='col-sm-4 pull-right' style={{textAlign: 'right'}}>
            {
              authenticated ?
              <span>
                <Button className='primary-btn' href={`/#${user.url}`} color='primary' variant='contained' startIcon={<PersonIcon />}>
                  {user.username}
                </Button>
                <span style={{marginLeft: '10px'}}>
                  <UserOptions />
                </span>
              </span>:
              <Button className='primary-btn' href="/#/accounts/login" color='primary' variant='contained'>
                Sign In
              </Button>
            }
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={onClose}>
            {theme.direction === 'ltr' ? <LeftIcon color='primary' /> : <RightIcon color='primary' />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {
            map(OPTIONS, option => {
              const { href, label, nested, selected } = option;
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
                  >
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
                              style={{paddingLeft: '32px'}}
                              >
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
        </List>
      </Drawer>
    </React.Fragment>
  )
}

export default Header;
