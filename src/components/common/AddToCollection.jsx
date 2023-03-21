import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Button, Tooltip,
  CircularProgress, Dialog, DialogActions, DialogContent,
  TextField, InputAdornment, Chip, Divider, List
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  Loyalty as LoyaltyIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { map, isEmpty, get, filter, cloneDeep, compact, uniq } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUserCollections, getCurrentUser } from '../../common/utils';
import CommonFormDrawer from '../common/CommonFormDrawer';
import CollectionForm from '../collections/CollectionForm';
import AddReferencesResult from './AddReferencesResult';
import ReferenceCascadeDialog from './ReferenceCascadeDialog';
import MappingReferenceAddOptionsDialog from './MappingReferenceAddOptionsDialog';
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import CollectionListItem from './CollectionListItem';
import PopperGrow from './PopperGrow';

const NEW_COLLECTION = {id: '__new__', name: 'Create New Collection'}

class AddToCollection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      lockedCollection: null,
      selectedCollection: null,
      isLoading: true,
      isAdding: false,
      allCollections: [],
      collections: [],
      cascadeMappings: false,
      cascadeToConcepts: false,
      cascadeMethod: false,
      result: false,
      collectionForm: false,
      addMappings: true,
      addToConcepts: false,
      addFromConcepts: false,
      transformReferences: false,
    }
    this.anchorRef = React.createRef(null);
  }

  toggleCollectionForm = () => this.setState({collectionForm: !this.state.collectionForm})

  componentDidUpdate(prevProps, prevState) {
    if(this.state.open && !prevState.open && isEmpty(this.state.collections))
      this.fetchCollections()
  }

  fetchCollections() {
    getCurrentUserCollections(collections => {
      this.setState({
        collections: [...this.state.collections, ...collections],
        allCollections: [...this.state.collections, ...collections],
        isLoading: false,
      })}
                             )
  }

  handleClose = event => {
    if (this.anchorRef.current && this.anchorRef.current.contains(event.target)) {
      return;
    }
    this.toggleOpen()
  };

  toggleOpen = () => this.setState({open: !this.state.open})

  handleDialogClose = () => this.setState({selectedCollection: null})

  onCheckboxChange = event => this.setState({[event.target.name]: event.target.checked})

  handleMenuItemClick = (event, collection) => {
    if(get(collection, 'id') === '__new__')
      this.toggleCollectionForm()
    else
      this.setState({selectedCollection: collection}, () => this.handleClose(event))
  }

  getPayload = (cascadeToConcepts, cascadeMappings, cascadeMethod) => {
    const { addMappings, addToConcepts, addFromConcepts } = this.state
    const { references } = this.props
    const isMapping = Boolean(get(references, '0.map_type'))
    let expressions = map(references, 'url')
    let queryParams = this.state.transformReferences ? {transformReferences: 'resourceVersions'} : {}
    let cascadePayload = {}
    if(isMapping) {
      if(addMappings)
        expressions = map(references, 'url')
      if(addToConcepts)
        expressions = compact([...expressions, ...map(references, 'to_concept_url')])
      if(addFromConcepts)
        expressions = compact([...expressions, ...map(references, 'from_concept_url')])
      expressions = uniq(expressions)
    } else {
      expressions = map(references, 'url')
      if(cascadeToConcepts)
        queryParams = {...queryParams, cascade: 'sourcetoconcepts'}
      else if(cascadeMappings)
        queryParams = {...queryParams, cascade: 'sourcemappings'}
      else if(cascadeMethod) {
        cascadePayload = {method: 'sourcetoconcepts', cascade_levels: '*', map_types: 'Q-AND-A,CONCEPT-SET', return_map_types: '*'}
      }
    }
    let payload = {payload: {data: {expressions: expressions}}, queryParams: queryParams}
    if(!isEmpty(cascadePayload))
      payload.payload.cascade = cascadePayload
    return payload
  }

  handleAdd = () => {
    const { selectedCollection, cascadeMappings, cascadeToConcepts, cascadeMethod } = this.state
    const payload = this.getPayload(cascadeToConcepts, cascadeMappings, cascadeMethod)
    if(isEmpty(payload?.payload?.data?.expressions)) {
      alertifyjs.error('No expressions to add')
    } else {
      this.setState({isAdding: true}, () => {
        this._collectionName = this.getCollectionName()
        APIService.new().overrideURL(selectedCollection.url)
          .appendToUrl('references/')
          .put(payload.payload, null, null, payload.queryParams)
          .then(response => {
            this.setState({isAdding: false}, () => {
              if(response.status === 200) {
                this.setState({result: response.data})
                alertifyjs.success('Successfully added reference(s)')
                this.handleDialogClose()
              } else {
                alertifyjs.error('Something bad happened')
                this.handleDialogClose()
              }
            })
          })
      })
    }
  }

  afterNewCollectionAdd = newCollection => this.setState({
    selectedCollection: newCollection,
    allCollections: [...this.state.allCollections, newCollection]
  })

  getFilteredCollections(value) {
    return filter(this.state.allCollections, collection => {
      const name = collection.short_code + '/' + collection.owner;
      return name.toLowerCase().match(value.trim())
    })
  }

  onSearchValueChange = event => this.setState({
    searchedValue: event.target.value,
    collections: event.target.value.trim() ?
      this.getFilteredCollections(event.target.value) :
      this.state.allCollections
  })

  getButton = () => {
    const { iconButton, ...rest } = this.props;
    if(iconButton)
      return (
        <Tooltip arrow title='Add to Collection'>
          <Button ref={this.anchorRef} onClick={this.toggleOpen} {...rest} color='secondary'>
            <LoyaltyIcon fontSize='inherit' />
          </Button>
        </Tooltip>
      )
    return (
      <Chip className='selected-control-chip' ref={this.anchorRef} onClick={this.toggleOpen} icon={<LoyaltyIcon />} deleteIcon={<ArrowDropDownIcon />} color='secondary' {...rest} onDelete={this.toggleOpen} label='Add to Collection' />
    )
  }

  getCollectionName = () => this.state.selectedCollection ? `${this.state.selectedCollection.owner}/${this.state.selectedCollection.short_code}` : ''

  render() {
    const {
      open, allCollections, collections, selectedCollection, isAdding, isLoading, searchedValue, collectionForm, result
    } = this.state;
    const { references } = this.props
    const openDialog = Boolean(selectedCollection)
    const collectionName = openDialog ? this.getCollectionName() : '';
    const _collections = [...collections, cloneDeep(NEW_COLLECTION)]
    const noOverallCollections = !isLoading && allCollections.length === 0;
    const noSearchResults = !isLoading && searchedValue && collections.length === 0;
    const button = this.getButton();
    const isMappingReferences = Boolean(get(references, '0.map_type'))

    return (
      <React.Fragment>
        {button}
        <PopperGrow open={open} anchorRef={this.anchorRef} handleClose={this.handleClose} minWidth='450px'>
          <div>
            {
              noOverallCollections ?
                <p style={{padding: '20px'}}>
                  You do not have any collections.
                  <a style={{cursor: 'pointer', marginLeft: '2px'}} onClick={this.toggleCollectionForm}>
                    Create New Collection?
                  </a>
                </p> :
                <List variant='menu' id="split-button-menu" style={{maxWidth: '500px', maxHeight: '300px', overflow: 'auto'}}>
                  <TextField
                    id='collection-search-input'
                    placeholder='Search Collection...'
                    variant='outlined'
                    size='small'
                    style={{padding: '10px', width: '100%'}}
                    autoFocus
                    onChange={this.onSearchValueChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                  {
                    isLoading ?
                      <div style={{textAlign: 'center'}}>
                        <CircularProgress />
                      </div> : (
                        noSearchResults ?
                          <p style={{padding: '0 20px'}}>
                            No Matches.
                            <a style={{cursor: 'pointer', marginLeft: '2px'}} onClick={this.toggleCollectionForm}>
                              Create New Collection?
                            </a>
                          </p> :
                          map(_collections, (collection, index) => (
                            <React.Fragment key={index}>
                              <CollectionListItem
                                option={collection}
                                listItemProps={{onClick: event => this.handleMenuItemClick(event, collection)}}
                                style={{cursor: 'pointer'}}
                              />
                              <Divider variant="inset" component="li" style={{listStyle: 'none'}} />
                            </React.Fragment>
                          ))
                      )
                  }
                </List>
            }
          </div>
        </PopperGrow>
        <Dialog open={openDialog} onClose={this.handleDialogClose}>
          <DialogTitleWithCloseButton onClose={this.handleDialogClose}>
            Add References to Collection
          </DialogTitleWithCloseButton>
          {
            isAdding ?
              <DialogContent style={{textAlign: 'center', margin: '50px'}}><CircularProgress /></DialogContent> :
            (
              isMappingReferences ?
                <MappingReferenceAddOptionsDialog references={references} onChange={states => this.setState({addMappings: states.addMappings, addToConcepts: states.addToConcepts, addFromConcepts: states.addFromConcepts})} collectionName={collectionName} /> :
              <ReferenceCascadeDialog
                references={references}
                onCascadeChange={states => this.setState({cascadeToConcepts: states.cascadeToConcepts, cascadeMappings: states.cascadeMappings, cascadeMethod: states.cascadeMethod})}
                collectionName={collectionName}
                collection={selectedCollection}
                noCascadePayloadFunc={() => this.getPayload()}
                cascadeMappingsFunc={() => this.getPayload(false, true, false)}
                cascadeToConceptsFunc={() => this.getPayload(true, false, false)}
                cascadeOpenMRSFunc={() => this.getPayload(false, false, true)}
                onTransformReferencesChange={transform => this.setState({transformReferences: transform})}
              />
            )
          }
          <DialogActions>
            <React.Fragment>
              <Button onClick={this.handleDialogClose} color="secondary" disabled={isAdding}>
                Cancel
              </Button>
              <Button onClick={this.handleAdd} color="primary" disabled={isAdding}>
                Add
              </Button>
            </React.Fragment>
          </DialogActions>
        </Dialog>
        {
          result &&
            <AddReferencesResult
              title={`Results: Add Reference(s) to ${this._collectionName}`}
              open={Boolean(result)}
              onClose={() => this.setState({result: false})}
              result={result}
            />
        }
        <CommonFormDrawer
          style={{zIndex: 1202}}
          isOpen={collectionForm}
          onClose={this.toggleCollectionForm}
          size='smedium'
          formComponent={
            <CollectionForm
              anonymous
              newCollectionProps={{
                name: (searchedValue || '').trim()
              }}
              onCancel={this.toggleCollectionForm}
              owner={getCurrentUser()}
              onSuccess={this.afterNewCollectionAdd}
            />
          }
        />
      </React.Fragment>
    )
  }
}

export default AddToCollection;
