import React from 'react';
import { get, map, includes, pickBy, isString, isObject, reject } from 'lodash';
import { TABLE_LAYOUT_ID, LIST_LAYOUT_ID, SPLIT_LAYOUT_ID } from '../../common/constants';
import CustomText from '../common/CustomText';
import OrgHomeChildrenList from './OrgHomeChildrenList';
import Overview from './Overview'

const HomeTabContent = ({
  org, tab, selectedConfig, location, match, url, pins, showPin, onPinCreate, onPinDelete, aboutTab, onPinOrderUpdate, members
}) => {
  const tabConfigs = aboutTab ? selectedConfig.config.tabs : reject(selectedConfig.config.tabs, {type: 'about'});
  const selectedTabConfig = tabConfigs[tab];
  const getSortParams = () => {
    if(selectedTabConfig) {
      if(selectedTabConfig.sortAsc)
        return {sortAsc: selectedTabConfig.sortAsc}
      if(selectedTabConfig.sortDesc)
        return {sortDesc: selectedTabConfig.sortDesc}
    }
  }
  const isInvalidTabConfig = !includes(['sources', 'collections', 'about', 'users', 'text'], selectedTabConfig.type) && !selectedTabConfig.uri;

  return (
    <div style={{display: 'flex', height: 'auto', width: '100%', overflow: 'auto', padding: '0 10px 10px 10px'}}>
      {
        isInvalidTabConfig &&
        <div>Invalid Tab Configuration</div>
      }
      {
        !isInvalidTabConfig && selectedTabConfig.type === 'about' &&
        <Overview
          org={org}
          pins={pins}
          onPinDelete={onPinDelete}
          onPinOrderUpdate={onPinOrderUpdate}
          canDeletePin={showPin}
          members={members}
        />
      }
      {
        !isInvalidTabConfig && selectedTabConfig.type === 'text' &&
        <div className='col-md-12'>
          {
            map(selectedTabConfig.fields, field => {
              const value = field.value || get(org, field.id);
              const label = field.label
              return <CustomText key={value || field.url} title={label} value={value} format={field.format} url={field.url} />
            })
          }
        </div>
      }
      {
        !isInvalidTabConfig && !includes(['about', 'text'], selectedTabConfig.type) &&
        <OrgHomeChildrenList
          org={org}
          location={location}
          match={match}
          url={selectedTabConfig.uri || url}
          defaultURI={selectedTabConfig.defaultURI || selectedTabConfig.uri}
          pins={pins}
          showPin={showPin}
          onPinCreate={onPinCreate}
          onPinDelete={onPinDelete}
          resource={selectedTabConfig.type}
          viewFilters={pickBy(selectedTabConfig.filters, isString)}
          extraControlFilters={pickBy(selectedTabConfig.filters, isObject)}
          viewFields={selectedTabConfig.fields}
          fixedFilters={{
            limit: selectedTabConfig.page_size,
            isList: selectedTabConfig.layout === LIST_LAYOUT_ID,
            isSplit: selectedTabConfig.layout === SPLIT_LAYOUT_ID,
            isTable: !selectedTabConfig.layout || selectedTabConfig.layout === TABLE_LAYOUT_ID,
            sortParams: getSortParams()
          }}
          configQueryParams={selectedTabConfig.query_params}
        />
      }
    </div>
  )
}

export default HomeTabContent;
