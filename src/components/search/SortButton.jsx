import React from 'react';
import {
  Button, ButtonGroup, Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip
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
const SORT_ICON_STYLES = {fontSize: '12px', marginRight: '5px'};

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
    const isAsc = this.isAsc();
    return (
      <span>
        <Tooltip title='Sort By'>
          <ButtonGroup variant="outlined" color="primary" ref={this.anchorRef} aria-label="split button">
            <Button onClick={this.handleClick} style={{fontSize: '10px', padding: '2px 4px 2px 2px'}}>
              {
                isAsc ?
                <ArrowUpwardIcon style={SORT_ICON_STYLES} /> :
                <ArrowDownwardIcon style={SORT_ICON_STYLES} />
              }
              {OPTIONS[selectedOption].name}
            </Button>
            <Button
              color="primary"
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={this.toggleOpen}
              style={{padding: '0px', 'min-width': '30px'}}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
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
