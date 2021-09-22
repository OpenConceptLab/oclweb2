import React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import { map, reject, includes } from 'lodash';
import {
  List as ListIcon, Loyalty as LoyaltyIcon, Person as PersonIcon,
  Info as InfoIcon, Home as HomeIcon
} from '@material-ui/icons';
import { ORANGE, BLUE } from '../../common/constants';
import { currentUserHasAccess } from '../../common/utils';
import NewResourceButton from '../common/NewResourceButton';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SourceForm from '../sources/SourceForm';
import CollectionForm from '../collections/CollectionForm';
import ConfigSelect from '../common/ConfigSelect';
import MembersForm from './MembersForm'

const HomeTabs = props => {
  const {
    tab, url, onTabChange,
    selectedConfig, customConfigs, onConfigChange, aboutTab, showConfigSelection, tabColor,
  } = props;

  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const selectedTabColor = selectedTabConfig.color || tabColor;
  const [sourceForm, setSourceForm] = React.useState(false);
  const [collectionForm, setCollectionForm] = React.useState(false);
  const [membersForm, setMembersForm] = React.useState(false);
  const [configFormWidth, setConfigFormWidth] = React.useState(false);
  const hasAccess = currentUserHasAccess()
  const onNewClick = resource => {
    if(resource === 'source')
      setSourceForm(true)
    if(resource === 'collection')
      setCollectionForm(true)
    if(resource === 'editMembership')
      setMembersForm(true)
  }

  const getIcon = config => {
    const type = config.type
    if(type === 'sources')
      return <ListIcon />;
    if(type === 'collections')
      return <LoyaltyIcon />;
    if(type === 'users')
      return <PersonIcon />
    if(tabConfigs.indexOf(config) === 0)
      return <HomeIcon />
    if(includes(['about', 'text'], type))
      return <InfoIcon />
  }

  const width = configFormWidth ? "calc(100% - " + (configFormWidth - 15) + "px)" : '100%';
  return (
    <div className='col-md-12 no-side-padding' style={{width: width}}>
      <Tabs className='col-md-11 no-side-padding' value={tab} onChange={onTabChange} TabIndicatorProps={ {style: {background: selectedTabColor}} } indicatorColor='primary'>
        {
          map(tabConfigs, (config, index) => {
            const key = config.label + index
            const isSelected = index === tab
            const color = config.color || tabColor
            const icon = getIcon(config)
            return (
              <Tab
                style={color ? {color: color}: {}}
                index={index} key={key} id={key} label={
                  <span className='flex-vertical-center' style={isSelected ? {color: color || BLUE} : {}}>
                    {icon}
                    <span style={icon ? {marginLeft: '4px'} : {}}>{config.label}</span>
                  </span>
                }
              />
            )
          })
        }
      </Tabs>
      {
        hasAccess &&
        <div className='col-md-1 no-right-padding flex-vertical-center' style={{justifyContent: 'flex-end'}}>
          {
            showConfigSelection &&
            <span style={{marginRight: '10px'}}>
              <ConfigSelect
                selected={selectedConfig}
                configs={customConfigs}
                onChange={onConfigChange}
                color={ORANGE}
                resourceURL={url}
                onWidthChange={setConfigFormWidth}
                resource='orgs'
              />
            </span>
          }
          <NewResourceButton color={tabColor} resources={['source', 'collection', 'editMembership']} onClick={onNewClick} />
        </div>
      }
      <CommonFormDrawer
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          <SourceForm onCancel={() => setSourceForm(false)} reloadOnSuccess={tab==0} parentURL={url} />
        }
      />
      <CommonFormDrawer
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        formComponent={
          <CollectionForm onCancel={() => setCollectionForm(false)} reloadOnSuccess={tab==1} parentURL={url} />
        }
      />
      <CommonFormDrawer
        isOpen={membersForm}
        onClose={() => setMembersForm(false)}
        formComponent={
          <MembersForm onCancel={() => setMembersForm(false)} reloadOnSuccess={tab==2} parentURL={url} />
        }
      />
    </div>
  );
}

export default HomeTabs;
