import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Button, Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControlLabel, Checkbox, Divider, TextField, InputAdornment
} from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Loyalty as LoyaltyIcon,
  Help as HelpIcon,
  Search as SearchIcon,
} from '@material-ui/icons'
import { map, isEmpty, get, filter, cloneDeep } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUserCollections, getCurrentUser } from '../../common/utils';
import CommonFormDrawer from '../common/CommonFormDrawer';
import CollectionForm from '../collections/CollectionForm';

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
      cascadeMappings: true,
      notAdded: [],
      added: [],
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

  handleDialogClose = () => this.setState({selectedCollection: null, notAdded: []})

  onCheckboxChange = event => this.setState({cascadeMappings: event.target.checked})

  handleMenuItemClick = (event, collection) => {
    if(get(collection, 'id') === '__new__')
      this.toggleCollectionForm()
    else
      this.setState({selectedCollection: collection}, () => this.handleClose(event))
  }

  handleAdd = () => {
    const { selectedCollection, cascadeMappings } = this.state
    const { references } = this.props
    this.setState({isAdding: true}, () => {
      const expressions = map(references, 'url')
      const queryParams = cascadeMappings ? {cascade: 'sourcemappings'} : {}
      APIService.new().overrideURL(selectedCollection.url)
                .appendToUrl('references/')
                .put({data: {expressions: expressions}}, null, null, queryParams)
                .then(response => {
                  this.setState({isAdding: false}, () => {
                    if(response.status === 200) {
                      const notAddedReferences = filter(response.data, {added: false})
                      const addedReferences = filter(response.data, {added: true})
                      this.setState({notAdded: notAddedReferences, added: addedReferences})
                      if(isEmpty(notAddedReferences)) {
                        alertifyjs.success('Successfully added reference(s)')
                        this.handleDialogClose()
                      }
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
        <Tooltip title='Add to Collection'>
          <Button ref={this.anchorRef} onClick={this.toggleOpen} {...rest}>
            <LoyaltyIcon fontSize='inherit' />
          </Button>
        </Tooltip>
      )
    return (
      <Button ref={this.anchorRef} onClick={this.toggleOpen} startIcon={<LoyaltyIcon />} endIcon={<ArrowDropDownIcon />} {...rest}>
        Add to Collection
      </Button>
    )
  }

  render() {
    const {
      open, allCollections, collections, selectedCollection, cascadeMappings, notAdded, added, isAdding, isLoading, searchedValue, collectionForm
    } = this.state;
    const { references } = this.props
    const openDialog = Boolean(selectedCollection)
    const collectionName = openDialog ? `${selectedCollection.owner}/${selectedCollection.short_code}`: '';
    const unableToAdd = !isEmpty(notAdded)
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
            (
              unableToAdd ?
              <DialogContent>
                {
                  !isEmpty(added) &&
                  <MuiAlert variant="filled" severity="success" style={{margin: '5px 0'}}>
                    {`${added.length} Reference(s) successfully added.`}
                  </MuiAlert>
                }
                <MuiAlert variant="filled" severity="warning" style={{margin: '5px 0'}}>
                  {`${notAdded.length} Reference(s) listed below could not be added.`}
                </MuiAlert>
                {
                  map(notAdded, (reference, index) => (
                    <React.Fragment key={index}>
                      <div style={{padding: '10px', background: 'rgba(0, 0, 0, 0.05)'}}>
                        <span style={{marginRight: '5px'}}><b>{reference.expression}:</b></span>
                        <span>{get(reference, 'message.0', '')}</span>
                      </div>
                      <Divider />
                    </React.Fragment>

                  ))
                }
              </DialogContent> :
              <DialogContent>
                <DialogContentText style={{color: 'black', marginBottom: '20px'}}>
                  {`${references.length} selected reference(s) will be added to collection ${collectionName}`}
                </DialogContentText>
                <FormControlLabel
                  control={<Checkbox checked={cascadeMappings} onChange={this.onCheckboxChange} name="cascadeMappings" size='small' style={{paddingRight: '4px'}}/>}
                  label={
                    <span className='flex-vertical-center'>
                      <span style={{marginRight: '5px', fontSize: '14px'}}>Automatically add associated mappings</span>
                      <Tooltip title="A concept's associated mappings are mappings that originate from the specified concept (the 'from concept') and that are stored in the same source">
                        <HelpIcon fontSize='small' style={{fontSize: '14px'}}/>
                      </Tooltip>
                    </span>
                  }
                />
              </DialogContent>
            )
          }
          <DialogActions>
            {
              unableToAdd ?
              <Button onClick={this.handleDialogClose} color="primary" disabled={isAdding}>
                Close
              </Button> :
              <React.Fragment>
                <Button onClick={this.handleDialogClose} color="primary" disabled={isAdding}>
                  Cancel
                </Button>
                <Button onClick={this.handleAdd} color="primary" disabled={isAdding}>
                  Add
                </Button>
              </React.Fragment>
            }
          </DialogActions>
        </Dialog>
        <CommonFormDrawer
          isOpen={collectionForm}
          onClose={this.toggleCollectionForm}
          formComponent={
            <CollectionForm
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
