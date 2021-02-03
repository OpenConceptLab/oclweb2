import React from 'react';
import { Tabs, Tab, AppBar, CircularProgress, Button } from '@material-ui/core';
import {
  List as ListIcon,
  Loyalty as LoyaltyIcon,
  Home as HomeIcon,
  Add as AddIcon,
} from '@material-ui/icons';
import { isEmpty, startCase } from 'lodash';
import { WHITE, GREEN, ORANGE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import Search from '../search/Search';
import CommonFormDrawer from '../common/CommonFormDrawer';
import OrgForm from '../orgs/OrgForm';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';

const HEIGHT = '50px'
const ICON_STYLES = {marginRight: '10px', marginBottom: '0px'}
const TAB_STYLES = {minHeight: HEIGHT, paddingTop: '6px', height: HEIGHT}

const UserHomeTabs = props => {
  const { tab, user, onTabChange } = props;
  const [orgForm, setOrgForm] = React.useState(false);
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);

  const indicatorColorClass = () => tab === 2 ? 'bg-orange' : 'bg-green';
  const getIconStyles = (index, color) => tab === index ?
                                        {color: color, ...ICON_STYLES} :
                                        {...ICON_STYLES};
  const getTabStyles = (index, color) => tab === index ?
                                       {color: color, ...TAB_STYLES} :
                                       {...TAB_STYLES};
  const loaded = !isEmpty(user)
  const hasAccess = currentUserHasAccess();
  const onNewResourceClick = resource => {
    if(resource === 'organization')
      setOrgForm(true)
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
  }
  const getNewResourceButton = resource => {
    return (
      <Button
        size="small"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon fontSize="inherit"/>}
        onClick={() => onNewResourceClick(resource)}>
        {startCase(resource)}
      </Button>
    )
  }

  return (
    <div className='col-md-12'>
      <AppBar position="static" color="default" style={{backgroundColor: WHITE, boxShadow: 'none'}}>
        <Tabs
          value={tab}
          onChange={onTabChange}
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
              nested
              parentResource="user"
              baseURL={user.sources_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="sources"
              searchInputPlaceholder={`Search ${user.username} sources...`}
              newResourceComponent={hasAccess && getNewResourceButton('source')}
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
              nested
              parentResource="user"
              baseURL={user.collections_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="collections"
              searchInputPlaceholder={`Search ${user.username} collections...`}
              newResourceComponent={hasAccess && getNewResourceButton('collection')}
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
              nested
              parentResource="user"
              baseURL={user.organizations_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="organizations"
              searchInputPlaceholder={`Search ${user.username} organizations...`}
              newResourceComponent={hasAccess && getNewResourceButton('organization')}
            /> :
            <CircularProgress color="primary" />
          )
        }
      </div>
      <CommonFormDrawer
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          <SourceForm onCancel={() => setSourceForm(false)} reloadOnSuccess={tab==0} parentURL={user.url} />
        }
      />
      <CommonFormDrawer
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        formComponent={
          <CollectionForm onCancel={() => setCollectionForm(false)} reloadOnSuccess={tab==1} parentURL={user.url} />
        }
      />
      <CommonFormDrawer
        isOpen={orgForm}
        onClose={() => setOrgForm(false)}
        formComponent={
          <OrgForm onCancel={() => setOrgForm(false)} reloadOnSuccess={tab==2} successURI={user.organizations_url} />
        }
      />
    </div>
  )
}

export default UserHomeTabs;
