import React from 'react';
import { CircularProgress, Tabs, Tab, AppBar, Button, Menu, MenuItem } from '@material-ui/core';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon, List as ListIcon,
  Loyalty as LoyaltyIcon, Home as HomeIcon, Person as PersonIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@material-ui/icons'
import { get, startCase, invert } from 'lodash';
import { BLUE, WHITE, GREEN, ORANGE, DARKGRAY } from '../../common/constants';
import useResponsive from '../../hooks/useResponsive';

const HEIGHT = '50px'

const ICON_STYLES = {
  marginRight: '10px', marginBottom: '0px'
}

const TAB_STYLES = {
  minHeight: HEIGHT, paddingTop: '6px', height: HEIGHT
}

const RESOURCES = {
  concepts: 0, mappings: 1, sources: 2, collections: 3, organizations: 4, users: 5
}

const COLORS = [BLUE, BLUE, GREEN, GREEN, ORANGE, ORANGE]

const ResourceTabs = props => {
  const activeResource = props.active;
  const getActiveIndex = () => {
    return RESOURCES[props.active];
  }
  const [value, setValue] = React.useState(getActiveIndex());
  if(getActiveIndex() !== value)
    setValue(getActiveIndex())

  const handleChange = (event, newValue) => {
    setValue(() => {
      props.onClick(get(invert(RESOURCES), newValue))
      return newValue
    });
  };

  const getIconStyles = (index, color) => {
    const styles = {...ICON_STYLES}

    if(value === index)
      return {color: color, ...styles}

    return styles
  }

  const getTabStyles = (index, color) => {
    const styles = {...TAB_STYLES }

    if(value === index)
      return {color: color, ...styles}

    return styles
  }

  const indicatorColorClass = () => {
    if(value < 2)
      return 'bg-blue'
    if(value < 4)
      return 'bg-green'

    return 'bg-orange'
  }

  const getLabelComponent = (resource, color) => {
    const isLoading = props.results[activeResource].isLoadingCount
    const index = RESOURCES[resource] || 0;
    return (
      <span>
        <span>{startCase(resource)}</span>
        {
          isLoading ?
          inProgress(index, color) :
          <span className="resource-count-bubble" style={index === value ? {backgroundColor: color, color: WHITE} : {}}>
            {get(props.results, `${resource}.total`, 0).toLocaleString()}
          </span>
        }
      </span>
    );
  }

  const inProgress = (index, color) => {
    return <CircularProgress
             style={{marginLeft: '10px', width: '14px', height: '14px', color: index === value ? color : DARKGRAY}}
    />
  }

  const { isTabletLandscape, isMobileLarge } = useResponsive()
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (_, newValue) => {
    setAnchorEl(null);
    if(newValue){
      setValue(() => {
        props.onClick(get(invert(RESOURCES), newValue))
        return newValue
      });
    }
  };

  const getCurrentReource =(value)=>{
    const icons = [LocalOfferIcon, LinkIcon, ListIcon, LoyaltyIcon, HomeIcon, PersonIcon]
    const Icon = icons[value]
    return (
      <>
        <Icon fontSize='small' style={getIconStyles(value, COLORS[value])} />
        {getLabelComponent(Object.keys(RESOURCES).find(key => RESOURCES[key] === value), COLORS[value])}
      </>
    )
  }


  if(isMobileLarge){
    return (
      <div style={{margin:"10px 0"}}>
        <Button
          aria-controls="menu"
          aria-haspopup="true"
          variant="outlined"
          endIcon={<ArrowDropDownIcon style={{marginLeft:"15px"}} />}
          color="primary"
          onClick={handleOpenMenu}
        >
         {getCurrentReource(value)}
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={(e)=>handleCloseMenu(e, null)}
        >
          <MenuItem onClick={(e)=>handleCloseMenu(e, 0)}>
            <>
              <LocalOfferIcon fontSize='small' style={getIconStyles(0, BLUE)} />
              {getLabelComponent('concepts', BLUE)}
            </>
          </MenuItem>
          <MenuItem onClick={(e)=>handleCloseMenu(e, 1)}>
            <>
              <LinkIcon fontSize='small' style={getIconStyles(1, BLUE)} />
              {getLabelComponent('mappings', BLUE)}
            </>
          </MenuItem>
          <MenuItem onClick={(e)=>handleCloseMenu(e, 2)}>
            <>
              <ListIcon fontSize='small' style={getIconStyles(2, GREEN)} />
              {getLabelComponent('sources', GREEN)}
            </>
          </MenuItem>
          <MenuItem onClick={(e)=>handleCloseMenu(e, 3)}>
            <>
              <LoyaltyIcon fontSize='small' style={getIconStyles(3, GREEN)} />
              {getLabelComponent('collections', GREEN)}
            </>
          </MenuItem>
          <MenuItem onClick={(e)=>handleCloseMenu(e, 4)}>
            <>
              <HomeIcon fontSize='small' style={getIconStyles(4, ORANGE)} />
              {getLabelComponent('organizations', ORANGE)}
            </>
          </MenuItem>
          <MenuItem onClick={(e)=>handleCloseMenu(e, 5)}>
            <>
              <PersonIcon fontSize='small' style={getIconStyles(5, ORANGE)}/>
              {getLabelComponent('users', ORANGE)}
            </>
          </MenuItem>
        </Menu>
      </div>
    )
  }

  return (
    <div style={{width: '100%'}}>
      <AppBar position="static" color="default" style={{backgroundColor: WHITE, boxShadow: 'none', borderTop: '1px solid lightgray', borderBottom: '1px solid lightgray'}}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant={isTabletLandscape ? "scrollable" :"fullWidth"}
          style={{height: HEIGHT}}
          classes={{
            indicator: indicatorColorClass()
          }}
        >
          <Tab className='material-tab' label={getLabelComponent('concepts', BLUE)} icon={<LocalOfferIcon fontSize='small' style={getIconStyles(0, BLUE)} />} style={getTabStyles(0, BLUE)} />
          <Tab className='material-tab' label={getLabelComponent('mappings', BLUE)} icon={<LinkIcon fontSize='small' style={getIconStyles(1, BLUE)} />} style={getTabStyles(1, BLUE)} />
          <Tab className='material-tab' label={getLabelComponent('sources', GREEN)} icon={<ListIcon fontSize='small' style={getIconStyles(2, GREEN)} />} style={getTabStyles(2, GREEN)} />
          <Tab className='material-tab' label={getLabelComponent('collections', GREEN)} icon={<LoyaltyIcon fontSize='small' style={getIconStyles(3, GREEN)} />} style={getTabStyles(3, GREEN)} />
          <Tab className='material-tab' label={getLabelComponent('organizations', ORANGE)} icon={<HomeIcon fontSize='small' style={getIconStyles(4, ORANGE)} />} style={getTabStyles(4, ORANGE)} />
          <Tab className='material-tab' label={getLabelComponent('users', ORANGE)} icon={<PersonIcon fontSize='small' style={getIconStyles(5, ORANGE)}/>} style={getTabStyles(5, ORANGE)} />
        </Tabs>
      </AppBar>
    </div>
  );
}

export default ResourceTabs;
