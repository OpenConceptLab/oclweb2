import React from 'react';
import { useTranslation } from 'react-i18next'
import { Tabs, Tab, AppBar, CircularProgress, Button } from '@mui/material';
import {
  List as ListIcon,
  Loyalty as LoyaltyIcon,
  AccountBalance as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { isEmpty, startCase } from 'lodash';
import { WHITE, GREEN, ORANGE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import Search from '../search/Search';
import CommonFormDrawer from '../common/CommonFormDrawer';
import OrgForm from '../orgs/OrgForm';
import CollectionForm from '../collections/CollectionForm';
import SourceForm from '../sources/SourceForm';

const HEIGHT = '50px'
const ICON_STYLES = {marginRight: '10px', marginBottom: '0px'}
const TAB_STYLES = {minHeight: HEIGHT, paddingTop: '6px', height: HEIGHT}

const UserHomeTabs = props => {
  const { t } = useTranslation()
  const { tab, user } = props;
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
        {t(`resources.${resource}`)}
      </Button>
    )
  }

  return (
    <div className='col-xs-12 no-right-padding'>
      <AppBar position="static" color="default" style={{backgroundColor: WHITE, boxShadow: 'none'}}>
        <Tabs
          value={tab}
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
            label={t('user.tabs.sources')}
            icon={<ListIcon fontSize='small' style={getIconStyles(0, GREEN)} />}
            style={getTabStyles(0, GREEN)}
            component="a" href={`#${user.url}sources/`}
          />
          <Tab
            className='material-tab'
            label={t('user.tabs.collections')}
            icon={<LoyaltyIcon fontSize='small' style={getIconStyles(1, GREEN)} />}
            style={getTabStyles(1, GREEN)}
            component="a" href={`#${user.url}collections/`}
          />
          <Tab
            className='material-tab'
            label={t('user.tabs.orgs')}
            icon={<HomeIcon fontSize='small' style={getIconStyles(2, ORANGE)} />}
            style={getTabStyles(2, ORANGE)}
            component="a" href={`#${user.url}orgs/`}
          />
        </Tabs>
      </AppBar>
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto'}}>
        {
          tab === 0 &&
          (
            loaded ?
            <Search
              {...props}
              nested
              essentialColumns
              parentResource="user"
              baseURL={user.sources_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="sources"
              searchInputPlaceholder={t('search.input_placeholder', {owner: user.username, resource: t('resources.sources').toLowerCase()})}
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
              essentialColumns
              parentResource="user"
              baseURL={user.collections_url}
              fixedFilters={{isTable: true, limit: 25}}
              resource="collections"
              searchInputPlaceholder={t('search.input_placeholder', {owner: user.username, resource: t('resources.collections').toLowerCase()})}
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
              searchInputPlaceholder={t('search.input_placeholder', {owner: user.username, resource: t('resources.orgs').toLowerCase()})}
              newResourceComponent={hasAccess && getNewResourceButton('organization')}
            /> :
            <CircularProgress color="primary" />
          )
        }
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        size='smedium'
        formComponent={
          <SourceForm onCancel={() => setSourceForm(false)} reloadOnSuccess={tab==0} owner={user} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        size='smedium'
        formComponent={
          <CollectionForm onCancel={() => setCollectionForm(false)} reloadOnSuccess={tab==1} owner={user} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
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
