import React from 'react';
import { Tabs, Tab, AppBar, CircularProgress } from '@material-ui/core';
import {
  List as ListIcon,
  Loyalty as LoyaltyIcon,
  Home as HomeIcon,
} from '@material-ui/icons';
import { isEmpty } from 'lodash';
import { WHITE, GREEN, ORANGE } from '../../common/constants';
import Search from '../search/Search';

const HEIGHT = '50px'
const ICON_STYLES = {marginRight: '10px', marginBottom: '0px'}
const TAB_STYLES = {minHeight: HEIGHT, paddingTop: '6px', height: HEIGHT}

const UserHomeTabs = props => {
  const { tab, onChange, user } = props;

  const indicatorColorClass = () => {
    if(tab == 2)
      return 'bg-orange'

    return 'bg-green'
  }

  const getIconStyles = (index, color) => {
    const styles = {...ICON_STYLES}

    if(tab === index)
      return {color: color, ...styles}

    return styles
  }

  const getTabStyles = (index, color) => {
    const styles = {...TAB_STYLES}

    if(tab === index)
      return {color: color, ...styles}

    return styles
  }

  const loaded = !isEmpty(user)

  return (
    <div className='col-md-12'>
      <AppBar position="static" color="default" style={{backgroundColor: WHITE, boxShadow: 'none'}}>
        <Tabs
          value={tab}
          onChange={onChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          style={{height: HEIGHT}}
          classes={{
            indicator: indicatorColorClass()
          }}
        >
          <Tab
            className='material-tab'
            label="User Sources"
            icon={<ListIcon fontSize='small' style={getIconStyles(0, GREEN)} />}
            style={getTabStyles(0, GREEN)}
          />
          <Tab
            className='material-tab'
            label="User Collections"
            icon={<LoyaltyIcon fontSize='small' style={getIconStyles(1, GREEN)} />}
            style={getTabStyles(1, GREEN)}
          />
          <Tab
            className='material-tab'
            label="Organization Membership"
            icon={<HomeIcon fontSize='small' style={getIconStyles(2, ORANGE)} />}
            style={getTabStyles(2, ORANGE)}
          />
        </Tabs>
      </AppBar>
      <div className='sub-tab-container' style={{display: 'flex', minHeight: '500px'}}>
        {
          tab === 0 &&
          (
            loaded ?
            <Search
              {...props}
              user={user}
              nested={true}
              baseURL={user.sources_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="sources"
            /> :
            <CircularProgress color="primary" />
          )
        }
        {
          tab === 1 &&
          (
            loaded ?
            <Search
              {...props}
              nested={true}
              baseURL={user.collections_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="collections"
            /> :
            <CircularProgress color="primary" />
          )
        }
        {
          tab === 2 &&
          (
            loaded ?
            <Search
              {...props}
              nested={true}
              baseURL={user.organizations_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="organizations"
            /> :
            <CircularProgress color="primary" />
          )
        }
      </div>
    </div>
  )
}

export default UserHomeTabs;
