import React from 'react';
import Search from '../search/Search';

class OrgHomeChildrenList extends React.Component {
  getURL() {
    const { url, resource } = this.props;

    return `${url}${resource}/`;
  }

  render() {
    return (
      <Search
        {...this.props}
        nested={true}
        baseURL={this.getURL()}
        fixedFilters={{isTable: true, limit: 25}}
      />
    )
  }
}

export default OrgHomeChildrenList;
