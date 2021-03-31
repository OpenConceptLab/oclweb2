import React from 'react';
import { Chip, MenuItem, Popper, Paper, Grow, MenuList } from '@material-ui/core';
import { min, isNaN, get, map } from 'lodash';
import { DEFAULT_LIMIT } from '../../common/constants';

const OPTIONS = [
  {id: '10', count: 10},
  {id: '25', count: 25},
  {id: '50', count: 50},
  {id: '100', count: 100},
]

const PageResultsLabel = ({ results, limit, isInfinite, onChange, disabled }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const getPageRange = () => {
    const total = get(results, 'total', 0)
    let _limit = limit || DEFAULT_LIMIT;

    if(total === 0)
      return [0, 0]

    const page = get(results, 'pageNumber') || 1
    const resultsInCurrentPage = min([(total - (_limit * (page-1))), _limit])
    let start = ((page - 1) * _limit) + 1;
    let end = start + resultsInCurrentPage - 1;

    if(isNaN(start)) start = 0;
    if(isNaN(end)) end = 0;

    if(isInfinite)
      start = 1

    return [start, end]
  };
  const pageRange = getPageRange();
  const onSetCount = _limit => {
    setAnchorEl(null);
    _limit = parseInt(_limit) || DEFAULT_LIMIT;
    onChange(_limit);
  }

  return (
    <React.Fragment>
      <Chip
        disabled={disabled}
        id='results-chip'
        onMouseOver={event => setAnchorEl(event.currentTarget)}
        onMouseOut={() => setAnchorEl(null)}
        variant='outlined'
        onClick={event => setAnchorEl(event.currentTarget)}
        label={
          <span style={{fontSize: '12px'}}>
            <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{`${pageRange[0]}-${pageRange[1]}`}</span>
            <span style={{paddingRight: '4px'}}>of</span>
            <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{get(results, 'total', 0).toLocaleString()}</span>
          </span>
        }
      />
      <Popper
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
        style={{zIndex: 1}}
        onMouseOver={() => anchorEl ? null : setAnchorEl(document.getElementById('results-chip'))}
        onMouseOut={() => setAnchorEl(null)}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
            <Paper>
              <MenuList autoFocusItem={Boolean(anchorEl)} id="menu-list-grow">
                {
                  map(OPTIONS, option => (
                    <MenuItem selected={limit === option.count} key={option.id} value={option.count} onClick={() => onSetCount(option.count)}>
                      {option.id}
                    </MenuItem>
                  ))
                }
              </MenuList>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )
}

export default PageResultsLabel;
