import React from 'react';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { set, map, orderBy, get, includes } from 'lodash';
import MixedOwnersAutocomplete from '../common/MixedOwnersAutocomplete';
import ConceptContainersAutocomplete from '../common/ConceptContainersAutocomplete';
import APIService from '../../services/APIService';
import Search from '../search/Search';

class ResourceReferenceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versions: [],
      sources: [],
      collections: [],
      concepts: [],
      mappings: [],
      owner: null,
      source: null,
      collection: null,
      version: null,
      expressions: [],
    }
  }

  onAutoCompleteChange = (id, item) => {
    this.setFieldValue(id, item)
  }

  setFieldValue(id, value) {
    const newState = {...this.state}
    set(newState, id, value)
    if(id === 'owner') {
      set(newState, 'source', null)
      set(newState, 'collection', null)
      set(newState, 'sources', [])
      set(newState, 'collections', [])
    }
    if (includes(['source', 'collection', 'owner'], id)) {
      set(newState, 'version', null)
      set(newState, 'versions', [])
    }
    if(id === 'source' && !value)
      newState.collection = null

    this.setState(newState, () => {
      if(id === 'owner')
        this.fetchConceptContainers()
      if(includes(['source', 'collection'], id))
        this.fetchVersions()
    })
  }

  fetchConceptContainers() {
    const { owner } = this.state

    if(owner) {
      APIService
        .new()
        .overrideURL(owner.url)
        .appendToUrl('sources/')
        .get()
        .then(response => this.setState({
          sources: map(response.data, source => ({...source, type: 'source'}))
        }))
      APIService
        .new()
        .overrideURL(owner.url)
        .appendToUrl('collections/')
        .get()
        .then(response => this.setState({
          collections: map(response.data, collection => ({...collection, type: 'collection'}))
        }))
    }
  }

  fetchVersions() {
    const { source, collection } = this.state;
    const container = source || collection;
    if(container) {
      APIService.new().overrideURL(container.url).appendToUrl('versions/').get().then(response => this.setState({versions: response.data}))
    }
  }

  onSelectChange = (resource, selectedList) => {
    this.setState(
      {[resource]: selectedList},
      () => this.props.onChange([...this.state.concepts, ...this.state.mappings])
    )
  }

  render() {
    const { owners } = this.props;
    const {
      owner, source, collection, sources, collections, version, versions
    } = this.state;
    return (
      <div className='col-md-12 no-side-padding'>
        <div className='col-md-4 no-left-padding'>
          <MixedOwnersAutocomplete
            owners={orderBy(owners, ['ownerType', 'name'])}
            selected={owner}
            onChange={this.onAutoCompleteChange}
            required
          />
        </div>
        <div className='col-md-6 no-left-padding'>
          <ConceptContainersAutocomplete
            items={orderBy([...sources, ...collections], ['type', 'name'], ['desc', 'asc'])}
            selected={source || collection}
            onChange={this.onAutoCompleteChange}
            required
          />
        </div>
        <div className='col-md-2 no-side-padding' style={{width: '16.66666%', minWidth: '16.66666%'}}>
          <Autocomplete
            blurOnSelect
            openOnFocus
            getOptionSelected={(option, value) => option.version === get(value, 'version')}
            value={version}
            id='version'
            options={versions}
            getOptionLabel={option => option.version}
            fullWidth
            required
            renderInput={
              params => <TextField {...params} required label='Version' variant="outlined" fullWidth />
            }
            onChange={(event, item) => this.onAutoCompleteChange('version', item)}
          />
        </div>
        {
          version &&
          <React.Fragment>
            <div className='col-md-6 no-side-padding' style={{marginTop: '15px', width: '50%', minWidth: '50%', borderRight: '1px solid lightgray'}}>
              <Search
                {...this.props}
                resource='concepts'
                nested
                essentialColumns
                baseURL={version.url + 'concepts/'}
                fixedFilters={{isTable: false, limit: 25}}
                searchInputPlaceholder={`Search concepts...`}
                noFilters
                noNav
                onSelectChange={selectedList => this.onSelectChange('concepts', selectedList)}
              />
            </div>
            <div className='col-md-6 no-right-padding' style={{marginTop: '15px', width: '50%', minWidth: '50%'}}>
              <Search
                {...this.props}
                resource='mappings'
                nested
                essentialColumns
                baseURL={version.url + 'mappings/'}
                fixedFilters={{isTable: false, limit: 25}}
                searchInputPlaceholder={`Search mappings...`}
                noFilters
                noNav
                onSelectChange={selectedList => this.onSelectChange('mappings', selectedList)}
              />
            </div>
          </React.Fragment>
        }
      </div>
    )
  }
}

export default ResourceReferenceForm;
