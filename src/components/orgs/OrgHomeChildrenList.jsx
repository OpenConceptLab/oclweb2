import React from 'react';
import Search from '../search/Search';

class OrgHomeChildrenList extends React.Component {
  getURL() {
    const { url, urlPath, resource } = this.props;
    const subPath = urlPath || resource

    return `${url}${subPath}/`;
  }

  render() {
    const { org, resource } = this.props;
    return (
      <Search
        {...this.props}
        nested={true}
        baseURL={this.getURL()}
        fixedFilters={{isTable: true, limit: 25}}
        searchInputPlaceholder={`Search ${org.id} ${resource}...`}
      />
    )
  }
}

export default OrgHomeChildrenList;
