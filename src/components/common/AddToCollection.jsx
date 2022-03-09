import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Button, Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, InputAdornment, Chip
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  Loyalty as LoyaltyIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { map, isEmpty, get, filter, cloneDeep } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUserCollections, getCurrentUser } from '../../common/utils';
import CommonFormDrawer from '../common/CommonFormDrawer';
import CollectionForm from '../collections/CollectionForm';
import AddReferencesResult from './AddReferencesResult';
import ReferenceCascadeDialog from './ReferenceCascadeDialog';

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
      result: false,
      collectionForm: false,
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

  handleAdd = () => {
    const { selectedCollection, cascadeMappings, cascadeToConcepts } = this.state
    const { references } = this.props
    this.setState({isAdding: true}, () => {
      const expressions = map(references, 'url')
      let queryParams = {}
      if(cascadeToConcepts)
        queryParams = {cascade: 'sourceToConcepts'}
      else if(cascadeMappings)
        queryParams = {cascade: 'sourceMappings'}

      APIService.new().overrideURL(selectedCollection.url)
                .appendToUrl('references/')
                .put({data: {expressions: expressions}}, null, null, queryParams)
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

  render() {
    const {
      open, allCollections, collections, selectedCollection, isAdding, isLoading, searchedValue, collectionForm, result
    } = this.state;
    const { references } = this.props
    const openDialog = Boolean(selectedCollection)
    const collectionName = openDialog ? `${selectedCollection.owner}/${selectedCollection.short_code}`: '';
    const _collections = [...collections, cloneDeep(NEW_COLLECTION)]
    const noOverallCollections = !isLoading && allCollections.length === 0;
    const noSearchResults = !isLoading && searchedValue && collections.length === 0;
    const button = this.getButton();

    return (
      <React.Fragment>
        {button}
        <Popper open={open} anchorEl={this.anchorRef.current} transition disablePortal style={{zIndex: 1000}}>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                zIndex: '1000'
              }}
              >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  {
                    noOverallCollections ?
                    <p style={{padding: '20px'}}>
                      You do not have any collections.
                      <a style={{cursor: 'pointer', marginLeft: '2px'}} onClick={this.toggleCollectionForm}>
                        Create New Collection?
                      </a>
                    </p> :
                    <MenuList variant='menu' id="split-button-menu" style={{maxHeight: '100%', overflow: 'auto'}}>
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
                        noSearchResults ?
                        <p style={{padding: '0 20px'}}>
                          No Matches.
                          <a style={{cursor: 'pointer', marginLeft: '2px'}} onClick={this.toggleCollectionForm}>
                            Create New Collection?
                          </a>
                        </p> :
                        map(_collections, (collection, index) => (
                          <MenuItem
                            id={collection.url}
                            key={index}
                            onClick={event => this.handleMenuItemClick(event, collection)}
                            style={{padding: '10px 15px'}}
                            >
                            <span className='flex-vertical-center'>
                              {
                                collection.owner ?
                                <React.Fragment>
                                  <span>{collection.owner}</span>
                                  <span style={{margin: '0 2px'}}>/</span>
                                  <span><b>{collection.short_code}</b></span>
                                </React.Fragment> :
                                <span><i>{collection.name}</i></span>
                              }
                            </span>
                          </MenuItem>
                        ))
                      }
                    </MenuList>
                  }
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        <Dialog open={openDialog} onClose={this.handleDialogClose}>
          <DialogTitle>
            {`Add To Collection: ${collectionName}`}
          </DialogTitle>
          {
            isAdding ?
            <DialogContent style={{textAlign: 'center', margin: '50px'}}><CircularProgress /></DialogContent> :
            <ReferenceCascadeDialog references={references} onCascadeChange={states => this.setState({cascadeToConcepts: states.cascadeToConcepts, cascadeMappings: states.cascadeMappings})} collectionName={collectionName} />
          }
          <DialogActions>
            <React.Fragment>
              <Button onClick={this.handleDialogClose} color="primary" disabled={isAdding}>
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
            title={`Add Reference(s) Result`}
            open={Boolean(result)}
            onClose={() => this.setState({result: false})}
            result={result}
          />
        }
        <CommonFormDrawer
          style={{zIndex: 1202}}
          isOpen={collectionForm}
          onClose={this.toggleCollectionForm}
          formComponent={
            <CollectionForm
              anonymous
              newCollectionProps={{
                name: (searchedValue || '').trim()
              }}
                                 onCancel={this.toggleCollectionForm}
                                 parentURL={get(getCurrentUser(), 'url')}
                                 onSuccess={this.afterNewCollectionAdd}
            />
          }
        />
      </React.Fragment>
    )
  }
}

export default AddToCollection;
