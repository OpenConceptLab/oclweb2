import React from 'react';
import { Tabs, Box } from '@mui/material';

const SearchFilters = ({ filterControls, layoutControls, nested }) => {
  return (
    <React.Fragment>
      <div className='col-xs-12 no-side-padding'>
        <Box sx={{ maxWidth: '100%', bgcolor: 'background.paper' }}>
          <Tabs
            value={0}
            variant="scrollable"
            style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 'auto', paddingTop: nested ? 0 : '5px'}}
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
                <React.Fragment>{ filterControls }</React.Fragment>
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
