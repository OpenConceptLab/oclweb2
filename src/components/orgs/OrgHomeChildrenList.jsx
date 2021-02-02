import React from 'react';
import { merge } from 'lodash';
import Search from '../search/Search';

class OrgHomeChildrenList extends React.Component {
  getURL() {
    const { url, urlPath, resource } = this.props;
    const subPath = urlPath || resource

    return `${url}${subPath}/`;
  }

  render() {
    const { org, resource, fixedFilters } = this.props;
    return (
      <Search
        {...this.props}
        nested
        baseURL={this.getURL()}
        fixedFilters={merge({isTable: true, limit: 25}, (fixedFilters || {}))}
        searchInputPlaceholder={`Search ${org.id} ${resource}...`}
      />
    )
  }
}

export default OrgHomeChildrenList;
