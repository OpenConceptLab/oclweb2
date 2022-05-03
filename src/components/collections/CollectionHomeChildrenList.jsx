import React from 'react';
import alertifyjs from 'alertifyjs';
import { includes, compact, isEmpty, get, merge, forEach } from 'lodash';
import Search from '../search/Search';
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
    const { versionedObjectURL, resource, expansion, expansions } = this.props;
    const expansionURL = get(expansion, 'url')
    let url = versionedObjectURL
    if(resource === 'references') {
      if(selectedVersion)
        return url + selectedVersion + '/' + resource + '/'
      return url + resource + '/'
    }
    if(expansionURL)
      return `${expansionURL}${resource}/`
    if(isEmpty(expansions)) {
      if(selectedVersion && !includes(['HEAD', 'concepts', 'mappings', 'about', 'versions', 'references'], selectedVersion))
        url += `${selectedVersion}/`
      url += `${resource}/`
      return url
    }
    return `${versionedObjectURL}/${resource}/`
  }

  onReferencesDelete = expressions => {
    const references = compact(expressions)
    if(!isEmpty(references)) {
      let deleted = 0
      let failed = []
      forEach(references, reference => {
        APIService.new().overrideURL(reference).delete().then(response => {
          if(get(response, 'status') === 204)
            deleted += 1
          else
            failed.push(reference)
          if(deleted === references.length)
            alertifyjs.success(`Successfully delete ${deleted} references`, 1, () => window.location.reload())
        })
      })
    }
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
        searchInputPlaceholder={`Search ${collection.name} ${resource}...`}
        onReferencesDelete={isVersionedObject && this.onReferencesDelete}
        isVersionedObject={isVersionedObject}
      />
    )
  }
}

export default CollectionHomeChildrenList;
