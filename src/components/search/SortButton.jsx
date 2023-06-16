import React from 'react';
import {
  Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip,
  Chip,
} from '@mui/material'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material'
import { map, startCase, get, includes } from 'lodash';
import { SORT_ATTRS } from './ResultConstants'

const ASC = 'asc';
const DESC = 'desc';
const SORT_ICON_STYLES = {width: '14px', height: '14px'};

class SortButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedOption: 'last_update',
      sortBy: 'desc',
    }

    this.anchorRef = React.createRef(null);
  }

  componentDidMount() {
    this.setState({
      selectedOption: this.props.sortOn || this.state.selectedOption,
      sortBy: this.props.sortBy || this.state.sortBy
    })
  }

  componentDidUpdate(prevProps) {
    if(
      prevProps.sortOn !== this.props.sortOn &&
      this.props.sortOn &&
      (this.props.sortOn !== this.state.selectedOption ||
       this.props.sortBy !== this.state.sortBy)
    )
    this.setState({
      selectedOption: this.props.sortOn,
      sortBy: this.props.sortBy || this.state.sortBy
    })
  }

  getOptions() {
    const { resource } = this.props;
    const sortables = get(SORT_ATTRS, resource) || []
    return map(sortables, attr => ({name: this.formatOptionName(attr), id: attr}))
  }

  isAsc() {
    return this.state.sortBy === ASC;
  }

  isDesc() {
    return this.state.sortBy === DESC;
  }

  toggleOrder = () => {
    const sortBy = this.isAsc() ? DESC : ASC;

    if(sortBy !== this.state.sortBy)
      this.setState({sortBy: sortBy }, this.propagate)
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  setSelectedOption = value => {
    if(value !== this.state.selectedOption)
      this.setState({selectedOption: value}, this.propagate)
  }

  handleMenuItemClick = value => {
    if(includes(['name', 'username', 'numeric_id'], value) && value !== this.state.selectedOption)
      this.setState({sortBy: ASC, selectedOption: value}, this.propagate)
    else
      this.setSelectedOption(value || 'score');

    this.toggleOpen();
  };

  toQueryParams() {
    const { selectedOption } = this.state;
    return this.isAsc() ? {sortAsc: selectedOption} : {sortDesc: selectedOption}
  }

  propagate() {
    this.props.onChange(this.toQueryParams())
  }

  handleClose = event => {
    if (this.anchorRef.current && this.anchorRef.current.contains(event.target)) {
      return;
    }
    this.toggleOpen()
  };

  handleClick = () => {
    this.toggleOrder();
  }

  getSelectedOptionName() {
    const { selectedOption } = this.state;
    return selectedOption === 'score' ? 'Best Match' : startCase(selectedOption)
  }

  formatOptionName(option) {
    if(option === 'score')
      return 'Best Match'
    if(option === 'id')
      return 'ID'
    if(option === 'numeric_id')
      return 'ID (numerically)'

    return startCase(option)
  }

  render() {
    const { open, selectedOption } = this.state;
    const { size } = this.props;
    const isAsc = this.isAsc();
    const selectedOptionName = this.getSelectedOptionName()
    const options = this.getOptions()
    return (
      <span>
        <Tooltip arrow title='Sort By'>
          <Chip
            ref={this.anchorRef}
            variant="outlined"
            icon={
              isAsc ?
                  <ArrowUpwardIcon fontSize="inherit" style={SORT_ICON_STYLES} /> :
                  <ArrowDownwardIcon fontSize="inherit" style={SORT_ICON_STYLES} />
            }
            color="primary"
            label={selectedOptionName}
            onClick={this.handleClick}
            size={size || 'medium'}
            deleteIcon={<ArrowDropDownIcon fontSize="inherit" />}
            onDelete={this.toggleOpen}
          />
        </Tooltip>
        <Popper open={open} anchorEl={this.anchorRef.current} transition style={{zIndex: 1000}}>
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
                  <MenuList id="split-button-menu">
                    {
                      map(options, (option, index) => (
                        <MenuItem
                          id={option.id}
                          key={index}
                          selected={option.id === selectedOption}
                          onClick={() => this.handleMenuItemClick(option.id)}
                          >
                          {option.name}
                        </MenuItem>
                      ))
                    }
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </span>
    )
  }
}

export default SortButton;
