import React from 'react';
import { Tabs, Tab } from '@mui/material';
import { get, reject, map, isEmpty } from 'lodash';
import ConceptContainerVersionList from '../common/ConceptContainerVersionList';
import About from '../common/About';
import ConceptTable from './ConceptTable';
import CodeList from './CodeList';

const ContainerHomeTabs = props => {
  const {
    tab, source, versions, location, versionedObjectURL, aboutTab, selectedConfig, onTabChange,
    isOCLDefaultConfigSelected, codes, hapi, onPageChange, isLoadingCodes, resource
  } = props;
  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const about = get(source, 'text.div')

  const getTABHref = tabConfig => {
    let href = '';
    if(tabConfig.type === 'about')
      href = `#${versionedObjectURL}/about`
    else if(tabConfig.type === 'versions')
      href = `#${versionedObjectURL}/versions`
    else if(tabConfig.type === 'codes')
      href = `#${versionedObjectURL}/codes`
    else if(tabConfig.href)
      href = `#${versionedObjectURL}/${tabConfig.href}`
    else {
      const urlAttr = tabConfig.type + '_url'
      href = `#${source[urlAttr]}`
    }
    return href + location.search
  }

  return (
    <div className='col-md-12 sub-tab'>
      <Tabs className='sub-tab-header col-md-8 no-side-padding' value={tab} onChange={onTabChange} aria-label="source-home-tabs" classes={{indicator: 'hidden'}}>
        {
          map(
            tabConfigs,
            config => {
              if(isOCLDefaultConfigSelected)
                return (<Tab key={config.label} label={config.label} component="a" href={getTABHref(config)}/>)
              else
                return (<Tab key={config.label} label={config.label} />)
            }
          )
        }
      </Tabs>
      <div className='sub-tab-container' style={{display: 'flex', height: 'auto', width: '100%'}}>
        {
          selectedTabConfig.type === 'about' &&
          <About id={source.id} about={about} />
        }
        {
          selectedTabConfig.type === 'versions' &&
          <ConceptContainerVersionList versions={versions} resource='source' canEdit={false} fhir />
        }

        {
          selectedTabConfig.type === 'codes' && (
            (resource === 'ValueSet' && !isEmpty(get(codes, 'systems'))) ?
            <CodeList codes={codes} isLoading={isLoadingCodes} hapi={hapi} /> :
            <ConceptTable concepts={codes} hapi={hapi} onPageChange={onPageChange} isLoading={isLoadingCodes} />
          )
        }
      </div>
    </div>
  );
}

export default ContainerHomeTabs;
