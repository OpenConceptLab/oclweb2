import React from 'react';
import { Tabs, Tab, AppBar, Skeleton } from '@mui/material';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon, List as ListIcon,
  Loyalty as LoyaltyIcon, AccountBalance as HomeIcon, Person as PersonIcon,
} from '@mui/icons-material'
import { get, startCase, invert } from 'lodash';
import { BLUE, WHITE, GREEN, ORANGE } from '../../common/constants';
import { isLoggedIn } from '../../common/utils';

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

const ResourceTabs = props => {
  const getActiveIndex = () => RESOURCES[props.active];
  const [value, setValue] = React.useState(getActiveIndex());
  if(getActiveIndex() !== value)
    setValue(getActiveIndex())

  const handleChange = (event, newValue) => setValue(() => {
    props.onClick(get(invert(RESOURCES), newValue))
    return newValue
  });

  const getIconStyles = (index, color) => {
    const styles = {...ICON_STYLES}

    if(value === index)
      return {color: color, ...styles}

    return styles
  }

  const getTabStyles = (index, color) => {
    const styles = {...TAB_STYLES}
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
    const isLoading = props.results[resource].isLoadingCount
    const index = RESOURCES[resource] || 0;
    return (
      <span className='flex-vertical-center'>
        <span>{startCase(resource)}</span>
        {
          isLoading ?
            <Skeleton width={50} height={30} style={{marginLeft: '10px', borderRadius: '10px'}} /> :
            <span className="resource-count-bubble" style={index === value ? {backgroundColor: color, color: WHITE} : {}}>
              {get(props.results, `${resource}.total`, 0).toLocaleString()}
            </span>
        }
      </span>
    );
  }

  return (
    <div style={{width: '100%'}}>
      <AppBar position="static" color="default" style={{backgroundColor: WHITE, boxShadow: 'none', borderTop: '1px solid lightgray', borderBottom: '1px solid lightgray'}}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant={props.isSplitView ? "scrollable" : "fullWidth"}
          scrollButtons={props.isSplitView}
          allowScrollButtonsMobile={props.isSplitView}
          style={{height: HEIGHT}}
          classes={{
            indicator: indicatorColorClass()
          }}
          TabScrollButtonProps={{
            classes: {
              disabled: 'hidden'
            }
          }}
        >
          <Tab className='material-tab' label={getLabelComponent('concepts', BLUE)} icon={<LocalOfferIcon fontSize='small' style={getIconStyles(0, BLUE)} />} style={getTabStyles(0, BLUE)} />
          <Tab className='material-tab' label={getLabelComponent('mappings', BLUE)} icon={<LinkIcon fontSize='small' style={getIconStyles(1, BLUE)} />} style={getTabStyles(1, BLUE)} />
          <Tab className='material-tab' label={getLabelComponent('sources', GREEN)} icon={<ListIcon fontSize='small' style={getIconStyles(2, GREEN)} />} style={getTabStyles(2, GREEN)} />
          <Tab className='material-tab' label={getLabelComponent('collections', GREEN)} icon={<LoyaltyIcon fontSize='small' style={getIconStyles(3, GREEN)} />} style={getTabStyles(3, GREEN)} />
          <Tab className='material-tab' label={getLabelComponent('organizations', ORANGE)} icon={<HomeIcon fontSize='small' style={getIconStyles(4, ORANGE)} />} style={getTabStyles(4, ORANGE)} />
          {
            isLoggedIn() &&
              <Tab className='material-tab' label={getLabelComponent('users', ORANGE)} icon={<PersonIcon fontSize='small' style={getIconStyles(5, ORANGE)}/>} style={getTabStyles(5, ORANGE)} />
          }
        </Tabs>
      </AppBar>
    </div>
  );
}

export default ResourceTabs;
