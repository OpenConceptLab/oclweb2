import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Button, Popper, List, Grow, Paper, ClickAwayListener, Tooltip,
  CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText,
  TextField, InputAdornment, Chip, Divider, Collapse
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Search as SearchIcon,
  AutoAwesome as BetaIcon,
} from '@mui/icons-material'
import { map, isEmpty, filter, omit, get } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUserSources } from '../../common/utils';
import { DEFAULT_CASCADE_PARAMS } from '../../common/constants';
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import SourceListItem from './SourceListItem';
import CascadeParametersForm from './CascadeParametersForm';
import ConceptTable from '../concepts/ConceptTable';
import APIPreview from './APIPreview'

class CloneToSource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      lockedSource: null,
      selectedSource: null,
      isLoading: true,
      isAdding: false,
      allSources: [],
      sources: [],
      result: false,
      advancedSettings: false,
      params: {
        ...omit(DEFAULT_CASCADE_PARAMS, ['method', 'cascadeHierarchy', 'cascadeMappings', 'includeRetired', 'reverse', 'view', 'omitIfExistsIn']),
        equivalencyMapType: 'SAME-AS',
        mapTypes: 'Q-AND-A,CONCEPT-SET'
      }
    }
    this.anchorRef = React.createRef(null);
  }

  toggleSettings = () => this.setState({advancedSettings: !this.state.advancedSettings})

  componentDidUpdate(prevProps, prevState) {
    if(this.state.open && !prevState.open && isEmpty(this.state.sources))
      this.fetchSources()
  }

  fetchSources() {
    getCurrentUserSources(sources => {
      this.setState({
        sources: [...this.state.sources, ...sources],
        allSources: [...this.state.sources, ...sources],
        isLoading: false,
      })})
  }

  handleClose = event => {
    if (this.anchorRef.current && this.anchorRef.current.contains(event.target)) {
      return;
    }
    this.toggleOpen()
  };

  toggleOpen = () => this.setState({open: !this.state.open, result: !this.state.open ? false : this.state.result})

  handleDialogClose = () => this.setState({selectedSource: null, result: false})

  onCheckboxChange = event => this.setState({[event.target.name]: event.target.checked})

  handleMenuItemClick = (event, source) => {
    this.setState({selectedSource: source}, () => this.handleClose(event))
  }

  getPayload = () => {
    const { params } = this.state
    const { references } = this.props
    return {
      expressions: map(references, 'url'),
      parameters: params
    }
  }

  getReferences = () => {
    const { references } = this.props
    const { result } = this.state
    if(result && references) {
      return map(references, concept => {
        const response = get(result, concept.url)
        let res = {...concept}
        if(response) {
          res.status = response.status
          res.total = response?.bundle?.total || 0
          res.bundle = response?.bundle
        }
        return res
      })
    }
    return references
  }

  handleAdd = () => {
    const { selectedSource } = this.state
    const payload = this.getPayload()
    if(isEmpty(payload?.expressions)) {
      alertifyjs.error('No expressions to add')
    } else {
      this.setState({isAdding: true}, () => {
        this._sourceName = this.getSourceName()
        APIService.new().overrideURL(selectedSource.url)
          .appendToUrl('concepts/$clone/')
          .post(payload)
          .then(response => {
            this.setState({isAdding: false, result: response?.data}, () => {
              if(response.status === 200) {
                alertifyjs.success('Successfully cloned concept(s)')
              } else {
                alertifyjs.error('Something bad happened')
              }
            })
          })
      })
    }
  }

  afterNewSourceAdd = newSource => this.setState({
    selectedSource: newSource,
    allSources: [...this.state.allSources, newSource]
  })

  getFilteredSources(value) {
    return filter(this.state.allSources, source => {
      const name = source.short_code + '/' + source.owner;
      return name.toLowerCase().match(value.trim())
    })
  }

  onSearchValueChange = event => this.setState({
    searchedValue: event.target.value,
    sources: event.target.value.trim() ?
      this.getFilteredSources(event.target.value) :
      this.state.allSources
  })

  getButton = () => {
    const { iconButton, ...rest } = this.props;
    if(iconButton)
      return (
        <Tooltip arrow title='Clone into source'>
          <Button ref={this.anchorRef} onClick={this.toggleOpen} {...rest} color='secondary'>
            <BetaIcon fontSize='inherit' />
          </Button>
        </Tooltip>
      )
    return (
      <Chip className='selected-control-chip' ref={this.anchorRef} onClick={this.toggleOpen} icon={<BetaIcon />} deleteIcon={<ArrowDropDownIcon />} color='secondary' {...rest} onDelete={this.toggleOpen} label='Clone (beta)' />
    )
  }

  getSourceName = () => this.state.selectedSource ? `${this.state.selectedSource.owner}/${this.state.selectedSource.short_code}` : ''

  render() {
    const {
      open, sources, selectedSource, isAdding, isLoading, searchedValue, result
    } = this.state;
    const openDialog = Boolean(selectedSource)
    const _sources = [...sources]
    const noSearchResults = !isLoading && searchedValue && sources.length === 0;
    const button = this.getButton();
    const requestURL = selectedSource?.url ? `${selectedSource.url}concepts/$clone/` : null
    const concepts = this.getReferences()

    return (
      <React.Fragment>
        {button}
        <Popper open={open} anchorEl={this.anchorRef.current} transition style={{zIndex: 1300}}>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                zIndex: '1300'
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  {
                    <List variant='menu' id="split-button-menu" style={{maxWidth: '500px', maxHeight: '100%', overflow: 'auto'}}>
                      <TextField
                        id='source-search-input'
                        placeholder='Select Source to clone into...'
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
                              </p> :
                            <List variant='menu' id="split-button-menu" style={{maxWidth: '500px', maxHeight: '300px', overflow: 'auto'}}>
                              {
                                map(_sources, (source, index) => (
                                  <React.Fragment key={index}>
                                    <SourceListItem
                                      option={source}
                                      listItemProps={{onClick: event => this.handleMenuItemClick(event, source)}}
                                      style={{cursor: 'pointer'}}
                                    />
                                    <Divider variant="inset" component="li" style={{listStyle: 'none'}} />
                                  </React.Fragment>
                                ))
                              }
                            </List>
                          )
                      }
                    </List>
                  }
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
        <Dialog open={openDialog} onClose={this.handleDialogClose} scroll='paper' fullWidth maxWidth='md' disableEscapeKeyDown={isAdding}>
          <DialogTitleWithCloseButton disaled={isAdding} onClose={this.handleDialogClose}>
            <BetaIcon style={{marginRight: '5px'}} /> Clone Concept(s) to Source: <b>{this.getSourceName()}</b> (beta)
          </DialogTitleWithCloseButton>
            <DialogContent>
              <DialogContentText>
                This operation will clone the selected concept(s), plus any answers or set members recursively following specified mappings. This will skip any concepts already (SAME-AS) in the destination.
              </DialogContentText>
              <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                <Button
                  size='small'
                  variant='text'
                  endIcon={
                    this.state.advancedSettings ?
                      <ArrowDropUpIcon fontSize='inherit' /> :
                      <ArrowDropDownIcon fontSize='inherit' />
                  }
                  style={{textTransform: 'none', marginLeft: '-4px'}}
                  onClick={this.toggleSettings}>
                  Advanced Settings
                </Button>
                <Collapse in={this.state.advancedSettings} timeout="auto" unmountOnExit>
                  {
                    this.state.advancedSettings &&
                      <div className='col-xs-12 no-side-padding' style={{margin: '15px 0'}}>
                        <div className='col-xs-12 no-side-padding' style={{margin: '15px 0'}}>
                          <DialogContentText style={{fontSize: '14px', marginBottom: '20px', marginTop: '-10px'}}>
                            Caution: changing these settings could yield an incomplete clone (e.g., missing answers or set members).
                          </DialogContentText>
                          </div>
                        <CascadeParametersForm
                          fieldClasses='col-xs-4'
                          hiddenFields={['method', 'cascadeHierarchy', 'omitIfExistsIn']}
                          defaultParams={{...this.state.params, omitIfExistsIn: selectedSource?.url}}
                          onChange={_params => this.setState({params: _params})}
                        />
                      </div>
                  }
                </Collapse>
              </div>
              <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                <DialogContentText>
                  {`${concepts.length} selected Concept(s) will be cloned into: `} <b>{this.getSourceName()}</b>
                </DialogContentText>
              </div>
              <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                <ConceptTable concepts={concepts} showProgress={isAdding} showStatus={isAdding || result} visualFilters={this.state.params} />
              </div>

              <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
                <APIPreview url={requestURL} payload={this.getPayload()} verb='POST' />
              </div>
            </DialogContent>
          <DialogActions>
            <React.Fragment>
              <Button onClick={this.handleDialogClose} color="secondary" disabled={isAdding}>
                Close
              </Button>
              {
                !result &&
                  <Button onClick={this.handleAdd} color="primary" disabled={isAdding}>
                    Add
                  </Button>
              }
            </React.Fragment>
          </DialogActions>
        </Dialog>
      </React.Fragment>
  )
}
}

export default CloneToSource;
