import React from 'react';
import { Tooltip, Chip, MenuItem, Menu } from '@material-ui/core'
import { FormatListNumberedRtl as NumberListIcon } from '@material-ui/icons'
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
      anchorEl: null,
    }
  }

  onSetCount = limit => {
    let _limit = parseInt(limit) || DEFAULT_LIMIT;
    if(_limit !== this.state.limit)
      this.setState({limit: _limit}, () => {
        this.toggleOpen();
        this.props.onChange(_limit);
      })
  }

  toggleOpen = event => {
    const newOpen = !this.state.open
    this.setState({open: newOpen, anchorEl: newOpen ? event.currentTarget : null})
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
    const { size } = this.props;
    const { limit, anchorEl } = this.state;
    return (
      <span>
        <Tooltip arrow title='Results Per Page'>
          <Chip
            variant="outlined"
            color='primary'
            icon={<NumberListIcon fontSize='inherit' />}
            label={`Page Size : ${limit}`}
            onClick={this.toggleOpen}
            size={size || 'medium'}
            style={{minWidth: '80px'}}
          />
        </Tooltip>
        <Menu
          id="results-size-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={this.toggleOpen}
        >
          {
            map(OPTIONS, option => (
              <MenuItem key={option.id} value={option.count} onClick={() => this.onSetCount(option.count)}>
                {option.id}
              </MenuItem>
            ))
          }
        </Menu>
      </span>
    )
  }
}

export default ResultsCountDropDown;
