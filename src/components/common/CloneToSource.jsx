import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Button, Popper, List, Grow, Paper, ClickAwayListener, Tooltip,
  CircularProgress, Dialog,
  TextField, InputAdornment, Chip, Divider
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon,
  AutoAwesome as BetaIcon,
} from '@mui/icons-material'
import { map, isEmpty, filter, omit, get, find } from 'lodash';
import APIService from '../../services/APIService';
import { getCurrentUserSources } from '../../common/utils';
import { DEFAULT_CASCADE_PARAMS } from '../../common/constants';
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import SourceListItem from './SourceListItem';
import CloneToSourceDialogContent from './CloneToSourceDialogContent';
import CloneToSourceResultPreview from './CloneToSourceResultPreview';
import BetaLabel from './BetaLabel'

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
      previewResults: {},
      advancedSettings: false,
      params: {
        ...omit(DEFAULT_CASCADE_PARAMS, ['method', 'cascadeHierarchy', 'cascadeMappings', 'includeRetired', 'reverse', 'view', 'omitIfExistsIn']),
        equivalencyMapType: 'SAME-AS',
        mapTypes: 'Q-AND-A,CONCEPT-SET'
      },
      previewConcept: false,
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

  handleDialogClose = () => this.setState({selectedSource: null, result: false, previewConcept: false, previewResults: {}})

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
    const { result, previewResults } = this.state
    let concepts = [...references]
    if((result || !isEmpty(previewResults)) && !isEmpty(concepts)) {
      concepts = map(concepts, concept => {
        let res = {...concept}
        if(result) {
          const response = get(result, concept.url)
          if(response) {
            res.status = response.status
            res.total = response?.bundle?.total || 0
            res.bundle = response?.bundle
          }
        }
        res.previewBundle = previewResults[concept.url]
        return res
      })
    }
    return concepts
  }

  fetchPreviewResults = isCloned => {
    const { previewConcept, previewResults, params, selectedSource } = this.state
    if(previewConcept && isEmpty(previewResults[previewConcept.url])) {
      let _params = {view: 'flat', listing: true}
      if(!isCloned)
        _params = {...params, omitIfExistsIn: selectedSource?.url, includeSelf: false, ..._params}
      APIService.new().overrideURL(previewConcept.url).appendToUrl('$cascade/').get(null, null, _params).then(response => {
        this.setState({previewResults: {[previewConcept.url]: response.data}}, () => {
          this.setState({previewConcept: isCloned ? {...previewConcept, previewBundle: response.data} : find(this.getReferences(), {url: previewConcept.url})})
        })
      })
    }
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
        <Tooltip arrow title='Clone to Source'>
          <Button ref={this.anchorRef} onClick={this.toggleOpen} {...rest} color='secondary'>
            <BetaIcon fontSize='inherit' />
          </Button>
        </Tooltip>
      )
    return (
      <Chip className='selected-control-chip' ref={this.anchorRef} onClick={this.toggleOpen} icon={<BetaIcon />} deleteIcon={<ArrowDropDownIcon />} color='secondary' {...rest} onDelete={this.toggleOpen} label={<BetaLabel label="Clone to Source"/>} />
    )
  }

  getSourceName = () => this.state.selectedSource ? `${this.state.selectedSource.owner}/${this.state.selectedSource.short_code}` : ''

  onPreviewClick = (concept, isCloned) => this.setState({previewConcept: concept}, () => this.fetchPreviewResults(isCloned))

  onPreviewClose = () => this.setState({previewConcept: false})

  render() {
    const {
      open, sources, selectedSource, isAdding, isLoading, searchedValue, result, previewConcept,
      advancedSettings, params
    } = this.state;
    const openDialog = Boolean(selectedSource)
    const _sources = [...sources]
    const noSearchResults = !isLoading && searchedValue && sources.length === 0;
    const button = this.getButton();
    const requestURL = selectedSource?.url ? `${selectedSource.url}concepts/$clone/` : null
    const concepts = this.getReferences()
    const isFetchingResultsForPreview = previewConcept && !get(previewConcept, 'previewBundle')
    const payload = this.getPayload()

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
          <DialogTitleWithCloseButton disabled={isAdding} onClose={this.handleDialogClose}>
            {
              previewConcept &&
                <Button size='small' startIcon={<BackIcon fontSize='inherit'/>} onClick={this.onPreviewClose} style={{marginRight: '10px'}}>
                  Back
                </Button>
            }
            <BetaIcon style={{marginRight: '5px'}} /> <BetaLabel label="Clone" /> Concept(s) to Source: <b>{this.getSourceName()}</b>
          </DialogTitleWithCloseButton>
          {
            previewConcept ?
              <CloneToSourceResultPreview
                concept={previewConcept}
                isLoading={isFetchingResultsForPreview}
              /> :
            <CloneToSourceDialogContent
              onClose={this.handleDialogClose}
              onAdd={this.handleAdd}
              advancedSettings={advancedSettings}
              toggleSettings={this.toggleSettings}
              defaultParams={{...params, omitIfExistsIn: selectedSource?.url}}
              onParamsChange={_params => this.setState({params: _params, previewResults: {}})}
              sourceName={this.getSourceName()}
              concepts={concepts}
              isAdding={isAdding}
              result={result}
              onPreviewClick={this.onPreviewClick}
              payload={payload}
              requestURL={requestURL}
            />
          }
        </Dialog>
      </React.Fragment>
    )
}
}

export default CloneToSource;
