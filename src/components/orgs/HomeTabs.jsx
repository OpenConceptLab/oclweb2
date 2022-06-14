import React from 'react';
import alertifyjs from 'alertifyjs';
import { Tabs, Tab } from '@mui/material';
import { map, reject, get } from 'lodash';
import { ORANGE, BLUE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ResponsiveDrawer from '../common/ResponsiveDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConfigSelect from '../common/ConfigSelect';
import DynamicConfigResourceIcon from '../common/DynamicConfigResourceIcon'
import MembersForm from './MembersForm'
import OverviewSettings from './OverviewSettings';

const HomeTabs = props => {
  const {
    tab, url, onTabChange, selectedConfig, customConfigs, onConfigChange,
    aboutTab, showConfigSelection, tabColor, isOCLDefaultConfigSelected, org
  } = props;

  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const selectedTabColor = get(selectedTabConfig, 'color') || tabColor;
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const [membersForm, setMembersForm] = React.useState(false);
  const [overviewSettings, setOverviewSettings] = React.useState(false);
  const hasAccess = currentUserHasAccess()
  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
    if(resource === 'editMembership')
      setMembersForm(true)
    if(resource === 'editOverviewSettings')
      setOverviewSettings(true)
  }

  const onCancelForm = (entity, callback) => {
    alertifyjs.confirm(
      'Are you sure you want to close?',
      `You will loose your data if you do not save the ${entity} first`,
      () => {},
      callback
    ).set('closable', false).set('labels', {ok: 'Go Back', cancel: 'Close without saving'})
  }

  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig.id)
      href = `#${org.url}${tabConfig.id}`
    else if(tabConfig.type === 'about')
      href = `#${org.url}about`
    else if(tabConfig.type === 'versions')
      href = `#${org.url}versions`
    else if(tabConfig.type === 'users')
      href = `#${org.url}members`
    else if(tabConfig.href)
      href = `#${org.url}${tabConfig.href}`
    else if (isOCLDefaultConfigSelected) {
      const urlAttr = tabConfig.type + '_url'
      href = `#${org[urlAttr]}`
    } else {
      href = `#${org.url}${tab}`
    }
    let queryString = location.hash.split('?')[1] || ''
    if(queryString)
      queryString = `?${queryString}`

    return href + queryString
  }

  let settingsOptions = ['source', 'collection', 'editMembership']
  if(tab === 0 && hasAccess)
    settingsOptions = [...settingsOptions, 'editOverviewSettings']
  return (
    <div className='col-xs-12 no-right-padding' style={{paddingLeft: '10px'}}>
      <Tabs
        className={hasAccess ? 'col-xs-11 no-side-padding' : 'col-xs-12 no-side-padding'}
        value={tab}
        onChange={onTabChange}
        TabIndicatorProps={{style: {background: selectedTabColor}}}
        TabScrollButtonProps={{
          style: tabColor ? {color: tabColor}: {},
          classes: {
            disabled: 'hidden'
          }
        }}
        indicatorColor='primary'
        variant="scrollable"
        allowScrollButtonsMobile>
        {
          map(tabConfigs, (config, index) => {
            const key = config.label + index
            const isSelected = index === tab
            const color = config.color || tabColor
            const label = (
              <span className='flex-vertical-center' style={isSelected ? {color: color || BLUE} : {}}>
                <DynamicConfigResourceIcon icon={config.icon} resource={config.type} index={tabConfigs.indexOf(config)} style={{width: '0.7em'}} />
                <span style={{marginLeft: '4px'}}>{config.label}</span>
              </span>
            );
            return (
              <Tab
                style={color ? {color: color}: {}}
                index={index}
                key={key}
                id={key}
                label={label}
                component="a"
                href={getTABHref(config)}
                className='capitalize'
              />
            )
          })
        }
      </Tabs>
      {
        hasAccess &&
        <div className='col-xs-1 no-right-padding flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          {
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={ORANGE}
                resourceURL={url}
                resource='orgs'
              />
            </span>
          }
          <NewResourceButton color={tabColor} resources={settingsOptions} onClick={onNewClick} />
        </div>
      }
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={sourceForm}
        onClose={() => onCancelForm('Source', () => setSourceForm(false))}
        formComponent={
          <SourceForm onCancel={() => setSourceForm(false)} reloadOnSuccess={tab==1} parentURL={url} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={collectionForm}
        onClose={() => onCancelForm('Collection', () => setCollectionForm(false))}
        formComponent={
          <CollectionForm onCancel={() => setCollectionForm(false)} reloadOnSuccess={tab==2} parentURL={url} />
        }
      />
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={membersForm}
        onClose={() => onCancelForm('Members', () => setMembersForm(false))}
        formComponent={
          <MembersForm onCancel={() => setMembersForm(false)} reloadOnSuccess={tab==3} parentURL={url} />
        }
      />
      <ResponsiveDrawer
        variant='persistent'
        isOpen={overviewSettings}
        onClose={() => setOverviewSettings(false)}
        width={450}
        formComponent={
          <OverviewSettings
            org={org}
                onCancel={() => setOverviewSettings(false)}
                onChange={headerConfig => {
                    const config = {...selectedConfig}
                    config.config.header = {...headerConfig}
                    onConfigChange(config)
                }}
          />
        }
      />
    </div>
  );
}

export default HomeTabs;
