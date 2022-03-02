import React from 'react';
import { Chip, Tabs, Box } from '@mui/material';
import {
  FilterAlt as FilterIcon,
  FilterAltOff as FilterOffIcon
} from '@mui/icons-material';

const SearchFilters = ({ nested, filterControls, layoutControls }) => {
  const [show, setShow] = React.useState(false)
  return (
    <React.Fragment>
      <div className='col-xs-12 no-side-padding'>
        <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper' }}>
          <Tabs
            value={0}
            variant="scrollable"
            style={{display: 'flex', alignItems: 'center', margin: '-5px 0', justifyContent: 'space-between'}}
            TabIndicatorProps={{style: {display: 'none', background: 'transparent'}}}
            TabScrollButtonProps={{
              classes: {
                disabled: 'hidden'
              }
            }}
            classes={{flexContainer: 'flex-justify-content-space-between' }}
          >
            {
              filterControls &&
              <span className="search-filter-controls">
                <span className='filter-chip'>
                  <Chip
                    color='secondary'
                    variant='outlined'
                    size={nested ? 'small' : 'medium'}
                    label='Filters'
                    onClick={() => setShow(!show)}
                    icon={show ? <FilterOffIcon fontSize={nested ? 'small' : 'medium'} /> : <FilterIcon fontSize={nested ? 'small' : 'medium'} />}
                  />
                </span>
                {
                  show &&
                  <React.Fragment>{ filterControls }</React.Fragment>
                }
              </span>
            }
            {
              layoutControls &&
              <span className="search-layout-controls">
                { layoutControls }
              </span>
            }
          </Tabs>
        </Box>
      </div>
    </React.Fragment>
  )
}

export default SearchFilters;
