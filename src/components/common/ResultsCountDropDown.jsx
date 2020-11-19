import React from 'react';
import {
  Button, Popper, MenuItem, MenuList, Grow, Paper, ClickAwayListener, Tooltip, ButtonGroup,
} from '@material-ui/core'
import {
  ArrowDropDown as ArrowDropDownIcon,
} from '@material-ui/icons'
import { map } from 'lodash';
import { DEFAULT_LIMIT } from '../../common/constants';


const OPTIONS = [
  {id: '25', count: 25},
  {id: '50', count: 50},
  {id: '100', count: 100},
]

class ResultsCountDropDown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      limit: DEFAULT_LIMIT,
    }
    this.buttonRef = React.createRef(null);
  }

  onSetCount = limit => {
    let _limit = parseInt(limit) || DEFAULT_LIMIT;
    if(_limit !== this.state.limit)
      this.setState({limit: _limit}, () => {
        this.toggleOpen();
        this.props.onChange(_limit);
      })
  }

  toggleOpen = () => {
    this.setState({open: !this.state.open})
  }

  handleClose = event => {
    if (this.buttonRef.current && this.buttonRef.current.contains(event.target)) {
      return;
    }
    this.toggleOpen()
  }

  componentDidMount() {
    this.setDefaultLimitFromParent()
  }

  componentDidUpdate() {
    this.setDefaultLimitFromParent()
  }

  setDefaultLimitFromParent() {
    const { defaultLimit } = this.props;
    if(defaultLimit && defaultLimit !== this.state.limit)
      this.setState({limit: defaultLimit})
  }

  render() {
    const { total, size } = this.props;
    const { limit, open } = this.state;
    return (
      <span>
        <Tooltip title='Results Per Page'>
          <ButtonGroup variant="outlined" color="primary" ref={this.buttonRef} aria-label="limit button" size={size || 'medium'}>
            <Button style={{fontSize: '0.8125em'}} onClick={this.toggleOpen}>
              Results Per Page : {limit}
            </Button>
            <Button
              color="primary"
              aria-controls={open ? 'limit-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={this.toggleOpen}
              style={{padding: '0px', minWidth: '30px'}}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
        </Tooltip>
        <Popper open={open} anchorEl={this.buttonRef.current} transition disablePortal style={{zIndex: 1000}}>
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
                  <MenuList id="limit-button-menu">
                    {
                      map(OPTIONS, option => (
                        <MenuItem
                          id={option.id}
                          key={option.id}
                          selected={option.count === limit}
                          onClick={() => this.onSetCount(option.count)}
                          disabled={option.count !== limit && option.count > total}
                          >
                          {option.id}
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

export default ResultsCountDropDown;
