import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  includes, compact, isEmpty, get, merge, forEach, flatten, uniq, map, max, keys, filter
} from 'lodash';
import {
  Dialog, DialogContent, DialogTitle, Divider, CircularProgress,
  List, ListItem, FormControl, RadioGroup, FormControlLabel, Radio, Tooltip, Button
} from '@mui/material';
import { LocalOffer as LocalOfferIcon, Info as InfoIcon, AutoAwesome as BetaIcon } from '@mui/icons-material'
import { toFullAPIURL } from '../../common/utils';
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import Search from '../search/Search';
import APIService from '../../services/APIService';

class CollectionHomeChildrenList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVersion: this.props.currentVersion || 'HEAD',
      describeDelete: false,
      selectedResources: [],
      selectedResourceReferences: {},
      actions: {},
      allLoaded: false,
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

  onExecute = () => {
    const { actions, selectedResources, selectedResourceReferences } = this.state;

    const deleteReferenceResourceIds = compact(map(actions, (action, uuid) => action === 'delete' ? uuid : null))
    const deleteReferenceURIs = uniq(flatten(map(filter(selectedResources, resource => includes(deleteReferenceResourceIds, resource.uuid)), 'references')))
    const referenceIds = map(deleteReferenceURIs, uri => selectedResourceReferences[uri].id)
    this.deleteReferences(referenceIds, false)

    const excludeReferenceResourceIds = compact(map(actions, (action, uuid) => action === 'exclude' ? uuid : null))
    const excludeResources = filter(selectedResources, resource => includes(excludeReferenceResourceIds, resource.uuid))
    const data = {
      concepts: compact(map(excludeResources, resource => resource.type === 'Concept' ? resource.url : null)),
      mappings: compact(map(excludeResources, resource => resource.type === 'Mapping' ? resource.url : null)),
      exclude: true
    }

    APIService
      .new()
      .overrideURL(this.props.versionedObjectURL)
      .appendToUrl('references/').put({data: data}).then(() => {
        this.setState(
          {describeDelete: false},
          () => alertifyjs.success(`Successfully executed`, 1, () => window.location.reload())
        )
      })
  }

  deleteReferences = (referenceIds, alert = true) => {
    if(!isEmpty(referenceIds)) {
      APIService.new().overrideURL(this.props.versionedObjectURL).appendToUrl('references/').delete({ids: referenceIds}).then(response => {
        if(alert) {
          if(get(response, 'status') === 204)
            alertifyjs.success(`Successfully delete references`, 1, () => window.location.reload())
          else if(alert)
            alertifyjs.error('Failed!')
        }
      })
    }
  }

  onReferencesDelete = items => {
    if(!isEmpty(items)) {
      if(items[0].type === 'CollectionReference')
        this.deleteReferences(compact(map(items, 'id')), true)
      else {
        this.setState({describeDelete: true, selectedResources: items}, () => {
          const uniqRefs = uniq(compact(flatten(map(items, 'references'))))
          let count = 0;
          forEach(uniqRefs, referenceURI => {
            APIService.new().overrideURL(referenceURI).get().then(response => {
              const newState = {...this.state}
              newState.selectedResourceReferences[referenceURI] = response.data
              count += 1
              newState.allLoaded = uniqRefs.length == count
              this.setState(newState, () => {
                if(this.state.allLoaded)
                  this.updateActions()
              })
            })
          })
        })
      }
    }
  }

  updateActions = () => {
    const newState = {...this.state}
    forEach(newState.selectedResources, resource => {
      if(!get(newState.actions, resource.uuid))
        newState.actions[resource.uuid] = this.shouldMakeExclusion(resource) ? 'exclude' : 'delete'
    })
    this.setState(newState)
  }

  onClose = () => this.setState({describeDelete: false, actions: {}})

  shouldMakeExclusion = resource => {
    if((get(resource.references, 'length') || 0) > 1)
      return true
    let total = 0;
    forEach(resource.references, referenceURI => {
      const reference = this.state.selectedResourceReferences[referenceURI]
      if(reference) {
        total += reference.concepts
        total += reference.mappings
      }
    })
    return total === 0 || total > 1; // total===0 is needed so that when the references are loading exclusion stays as recommended/selected option
  }

  onActionChange = (event, resource, value) => this.setState({actions: {...this.state.actions, [resource.uuid]: value}})

  render() {
    const { selectedVersion, describeDelete, selectedResources, selectedResourceReferences, allLoaded, actions } = this.state;
    const { collection, resource, fixedFilters } = this.props;
    const isVersionedObject = !selectedVersion || selectedVersion === 'HEAD'
    const haveAllActions = keys(actions).length === selectedResources.length
    return (
      <React.Fragment>
        <Search
          {...this.props}
          nested
          baseURL={this.getURL()}
          fixedFilters={merge({isTable: true, limit: 25}, (fixedFilters || {}))}
          searchInputPlaceholder={`Search ${collection.name} ${resource}...`}
          onReferencesDelete={isVersionedObject && this.onReferencesDelete}
          isVersionedObject={isVersionedObject}
        />
        {
          describeDelete &&
            <Dialog open onClose={this.onClose} maxWidth='md' fullWidth>
              <DialogTitle>
                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <span className='flex-vertical-center'>
                    <Tooltip arrow title='Beta' placement='top'>
                      <BetaIcon style={{marginRight: '5px'}}/>
                    </Tooltip>
                    Remove Resources by Reference
                  </span>
                  <span>
                    <Button onClick={this.onExecute} variant='contained' color='error' disabled={!haveAllActions}>
                      Execute
                    </Button>
                  </span>
                </span>
              </DialogTitle>
              <DialogContent>
                {
                  map(selectedResources, (resource, index) => {
                    const shouldExclude = this.shouldMakeExclusion(resource)
                    const recommendedOption = shouldExclude ? 'exclude' : 'delete'
                    const excludeLabel = 'Exclude concept(s)/mapping(s) from collection'
                    const deleteLabel = `Remove reference(s)`
                    const recommended = '(recommended)'
                    return (
                      <React.Fragment key={index}>
                        <div className='col-xs-12' style={{marginBottom: '5px', borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.1)', padding: '5px 10px'}}>
                          <div className='col-xs-12 no-side-padding'>
                            <ResourceLabel
                              noExistsIcon
                              resource='concept'
                              owner={resource.owner}
                              parent={resource.source}
                              id={resource.id}
                              parentURL={resource.owner_url + 'sources/' + resource.source + '/'}
                              name={resource.display_name}
                              icon={
                                <LocalOfferIcon
                                  fontSize='small'
                                  style={{width: '10pt', color: DARKGRAY}}
                                />
                              }
                            />
                          </div>
                          <div className="col-xs-12" style={{paddingTop: '5px'}}>
                            {`This is a result of ${get(resource.references, 'length') || 0} reference(s):`}
                            </div>
                          <List dense style={{padding: '0 20px', display: 'inline-block'}}>
                            {
                              map(resource.references, uri => (
                                <React.Fragment key={`${index}-${uri}`}>
                                  <ListItem>
                                    <span style={{marginRight: '5px'}}>Reference:</span>
                                    {
                                      get(selectedResourceReferences, `${uri}.expression`) ?
                                        <a href={toFullAPIURL(uri)} target='_blank' rel='noopener noreferrer'>
                                          {selectedResourceReferences[uri].expression}
                                        </a> :
                                      <CircularProgress style={{marginLeft: '10px', width: '14px', height: '14px'}} />
                                    }
                                  </ListItem>
                                  <ListItem style={{marginTop: '-8px'}}>
                                    <span>
                                      <span style={{marginRight: '5px'}}>Concepts:</span>
                                      {
                                        get(selectedResourceReferences, uri) ?
                                          max([0, selectedResourceReferences[uri].concepts]) :
                                          '-'
                                      }
                                    </span>
                                    <Divider orientation='vertical' style={{height: '1rem', margin: '0 10px'}} />
                                    <span>
                                      <span style={{marginRight: '5px'}}>Mappings:</span>
                                      {
                                        get(selectedResourceReferences, uri) ?
                                          max([0, selectedResourceReferences[uri].mappings]) :
                                          '-'
                                      }
                                    </span>
                                  </ListItem>
                                </React.Fragment>
                              ))
                            }
                          </List>
                          {
                            allLoaded &&
                          <div className='col-xs-12'>
                            <FormControl style={{width: '100%'}}>
                              <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                name="reference-action"
                                onChange={(event, value) => this.onActionChange(event, resource, value)}
                                defaultValue={recommendedOption}
                              >
                                <FormControlLabel
                                  style={{marginLeft: '0px', padding: '5px', background: shouldExclude ? 'none' : 'rgba(51, 115, 170, 0.15)', borderRadius: '5px'}}
                                  value="delete"
                                  control={
                                    <Radio
                                      style={{padding: '2px 5px 2px 2px'}}
                                      sx={{
                                        '& .MuiSvgIcon-root': {
                                          fontSize:'0.9rem',
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <span className='flex-vertical-center' style={{fontSize: '0.9rem'}}>
                                      <span>{deleteLabel}</span>
                                      { !shouldExclude && <span style={{marginLeft: '5px'}}><i>{recommended}</i></span> }
                                      <Tooltip arrow placement='right' title="References will be removed if they are causing the selected resource(s) to appear in the collection. This cannot be undone, but the references can be added again in the References tab.">
                                        <InfoIcon color='default' fontSize='small' style={{marginLeft: '5px'}} />
                                      </Tooltip>
                                    </span>
                                  }
                                />
                                <FormControlLabel
                                  style={{marginLeft: '0px', padding: '5px', background: shouldExclude ? 'rgba(51, 115, 170, 0.15)' : 'none', borderRadius: '5px'}}
                                  value="exclude"
                                  control={
                                    <Radio
                                      style={{padding: '2px 5px 2px 2px'}}
                                      sx={{
                                        '& .MuiSvgIcon-root': {
                                          fontSize:'0.9rem',
                                        },
                                      }}
                                    />
                                  }
                                  label={
                                    <span className='flex-vertical-center' style={{fontSize: '0.9rem'}}>
                                      <span>{excludeLabel}</span>
                                      { shouldExclude && <span style={{marginLeft: '5px'}}><i>{recommended}</i></span> }
                                      <Tooltip arrow placement='right' title="Excluding a concept/mapping will ensure that it will not appear in the collection. This can be undone by deleting the exclusion reference(s) in the References tab.">
                                        <InfoIcon color='default' fontSize='small' style={{marginLeft: '5px'}} />
                                      </Tooltip>
                                    </span>
                                  }
                                />
                                <div style={{marginLeft: '40px', fontSize: '12px'}}>Exclusion Expression: <b>{resource.url}</b></div>
                              </RadioGroup>
                            </FormControl>
                          </div>
                          }
                        </div>
                      </React.Fragment>
                    )
                  })
                }
              </DialogContent>
            </Dialog>
        }
      </React.Fragment>
    )
  }
}

export default CollectionHomeChildrenList;
