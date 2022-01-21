import React from 'react';
import Search from '../search/Search';
import { includes, merge } from 'lodash';

class SourceHomeChildrenList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVersion: this.props.currentVersion || 'HEAD'
    }
  }

  getURL() {
    const { selectedVersion } = this.state;
    const { versionedObjectURL, resource } = this.props;
    let url = versionedObjectURL;
    if(selectedVersion && !includes(['HEAD', 'concepts', 'mappings', 'about', 'versions'], selectedVersion))
      url += `${selectedVersion}/`
    url += `${resource}/`

    return url
  }

  render() {
    const { source, resource, fixedFilters } = this.props
    return (
      <Search
        {...this.props}
        nested
        essentialColumns
        parentResource='source'
        baseURL={this.getURL()}
        fixedFilters={merge({isTable: true, limit: 25}, (fixedFilters || {}))}
        searchInputPlaceholder={`Search ${source.name} ${resource}...`}
      />
    )
  }
}

export default SourceHomeChildrenList;
