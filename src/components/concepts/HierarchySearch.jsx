import React from 'react'
import { CircularProgress, TextField } from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { Search as SearchIcon } from '@material-ui/icons'
import { debounce, isEmpty, get } from 'lodash'
import APIService from '../../services/APIService'

const MIN_CHARS = 3

class HierarchySearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      input: '',
      options: [],
      selected: '',
      fetched: false,
      open: false
    }
  }

  getLabel = option => {
    if(!option)
      return ''
    const showName = option.display_name && option.display_name !== option.id
    let name = option.id
    if(showName)
      name += ` ${option.display_name}`
    return name
  }

  getLabelDom = option => {
    const showName = option.display_name && option.display_name !== option.id
    return (
      <span style={{fontSize: '12px'}}>
        <span>
          {
            showName ?
            <React.Fragment><b>{option.id}</b>&nbsp;{option.display_name}</React.Fragment> :
            <React.Fragment>{option.id}</React.Fragment>
          }
        </span>
      </span>
    )
  }

  fetchResults = debounce(
    searchStr => APIService
      .new()
      .overrideURL(this.props.searchURL)
      .get(null, null, {q: searchStr})
      .then(res => this.setState({fetched: true, options: res.data}))
  )

  onInputChange = (event, value) => this.setState({fetched: false, input: value || ''}, () => {
    if(this.isSearchable())
      this.fetchResults(this.state.input)
  })
  onSelect = (event, item) => this.setState({selected: item}, () => {
    if(this.props.onChange)
      this.props.onChange(item)
  })

  minLengthToSearch = () => this.props.minCharactersForSearch || MIN_CHARS
  isSearchable = () => this.state.input && this.state.input.length >= this.minLengthToSearch()

  render() {
    const { options, selected, input, open, fetched } = this.state;
    const { label, style } = this.props
    const minLength = this.minLengthToSearch()
    const isSearchable = this.isSearchable()
    const loading = Boolean(open && !fetched && isSearchable && isEmpty(options))
    return (
      <Autocomplete
        style={style || {}}
        fullWidth
        openOnFocus
        blurOnSelect
        classes={{listbox: 'autocomplete-small', paper: 'autocomplete-small', inputRoot: 'autocomplete-small-input-root'}}
        size='small'
        value={selected}
        options={options}
        loading={loading}
        getOptionLabel={this.getLabel}
        onOpen={() => this.setState({open: true})}
        onClose={() => this.setState({open: false})}
        getOptionSelected={(option, value) => option.id === get(value, 'id')}
        loadingText={loading ? 'Loading...' : `Type atleast ${minLength} characters to search`}
        noOptionsText={(isSearchable && !loading) ? "No results" : 'Start typing...'}
        onInputChange={this.onInputChange}
        onChange={this.onSelect}
        renderInput={
          params => (
            <TextField
              {...params}
              className='input-small'
                         value={input}
                         label={label || ""}
                         variant="outlined"
                         fullWidth
                         InputProps={{
                           ...params.InputProps,
                           endAdornment: (
                             <React.Fragment>
                               {
                                 loading ?
                                 <CircularProgress color="inherit" size={20} /> :
                                 <SearchIcon size='small' />
                               }
                             </React.Fragment>
                           ),
                         }}
            />
          )
        }
        renderOption={this.getLabelDom}
      />
    )
  }
}

export default HierarchySearch
