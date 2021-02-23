import React from 'react';
import alertifyjs from 'alertifyjs';
import { map, includes, compact, isEmpty, get, merge } from 'lodash';
import Search from '../search/Search';
import VersionFilter from '../common/VersionFilter';
import APIService from '../../services/APIService';

class CollectionHomeChildrenList extends React.Component {
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
    if(selectedVersion && !includes(['HEAD', 'concepts', 'mappings', 'about', 'versions', 'references'], selectedVersion))
      url += `${selectedVersion}/`
    url += `${resource}/`

    return url
  }

  onChange = version => {
    this.setState({selectedVersion: version || 'HEAD'})
  }

  getExtraControls() {
    const { selectedVersion } = this.state;
    const { versions } = this.props;
    return (
      <VersionFilter
        size='small'
        onChange={this.onChange}
        versions={map(versions, 'id')}
        selected={selectedVersion}
      />
    )
  }

  onReferencesDelete = expressions => {
    const references = compact(expressions)
    const url = this.props.versionedObjectURL + 'references/'
    if(!isEmpty(references))
      APIService.new().overrideURL(url).appendToUrl('?cascade=sourcemappings').delete({references: references}).then(response => {
        if(get(response, 'status') === 204)
          alertifyjs.success('Successfully deleted references', 1, () => window.location.reload())
        else
          alertifyjs.error('Something bad happened!')
      })

  }

  render() {
    const { selectedVersion } = this.state;
    const { collection, resource, fixedFilters } = this.props;
    const isVersionedObject = !selectedVersion || selectedVersion === 'HEAD'
    return (
      <Search
        {...this.props}
        nested
        baseURL={this.getURL()}
        fixedFilters={merge({isTable: true, limit: 25}, (fixedFilters || {}))}
        extraControls={this.getExtraControls()}
        searchInputPlaceholder={`Search ${collection.name} ${resource}...`}
        onReferencesDelete={isVersionedObject && this.onReferencesDelete}
        isVersionedObject={isVersionedObject}
      />
    )
  }
}

export default CollectionHomeChildrenList;
