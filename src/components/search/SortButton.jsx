import React from 'react';
import {
  Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip,
  Chip,
} from '@material-ui/core'
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@material-ui/icons'
import { map } from 'lodash';

const OPTIONS = {
  '1': {name: 'Best Match', id: 'score'},
  '2': {name: 'Last Updated', id: 'last_update'},
  '3': {name: 'Name', id: 'name'},
}
const ASC = 'asc';
const DESC = 'desc';
const SORT_ICON_STYLES = {width: '14px', height: '14px'};

class SortButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedOption: '2',
      sortBy: 'desc',
    }

    this.anchorRef = React.createRef(null);
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
      this.setState({sortBy: sortBy }, this.propogate)
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  setSelectedOption = value => {
    if(value !== this.state.selectedOption)
      this.setState({selectedOption: value}, this.propogate)
  }

  handleMenuItemClick = value => {
    this.setSelectedOption(value || '1');
    this.toggleOpen();
  };

  toQueryParams() {
    const { selectedOption} = this.state;
    const option = OPTIONS[selectedOption].id
    if(this.isAsc())
      return {sortAsc: option}
    return {sortDesc: option}
  }

  propogate() {
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

  render() {
    const { open, selectedOption } = this.state;
    const { size } = this.props;
    const isAsc = this.isAsc();
    return (
      <span>
        <Tooltip title='Sort By'>
          <Chip
            ref={this.anchorRef}
            variant="outlined"
            icon={
              isAsc ?
                  <ArrowUpwardIcon fontSize="inherit" style={SORT_ICON_STYLES} /> :
                  <ArrowDownwardIcon fontSize="inherit" style={SORT_ICON_STYLES} />
            }
            color="primary"
            label={OPTIONS[selectedOption].name}
            onClick={this.handleClick}
            size={size || 'medium'}
            deleteIcon={<ArrowDropDownIcon fontSize="inherit" />}
            onDelete={this.toggleOpen}
          />
        </Tooltip>
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
                  <MenuList id="split-button-menu">
                    {
                      map(OPTIONS, (option, id) => (
                        <MenuItem
                          id={id}
                          key={id}
                          selected={id === selectedOption}
                          onClick={() => this.handleMenuItemClick(id)}
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
