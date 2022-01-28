import React from 'react';
import { Chip } from '@mui/material';
import {
  FilterAlt as FilterIcon
} from '@mui/icons-material';

const SearchFilters = ({ nested, controls }) => {
  const [show, setShow] = React.useState(false)
  return (
    <React.Fragment>
      {
        controls &&
        <div className='col-xs-12 no-side-padding' style={{display: 'inline-flex'}}>
          <Chip
            color='secondary'
            variant='outlined'
            size={nested ? 'small' : 'medium'}
            label={show ? 'Hide Filters' : 'Show Filters'}
            onClick={() => setShow(!show)}
            icon={<FilterIcon fontSize={nested ? 'small' : 'medium'} />}
            style={{marginRight: '4px'}}
          />
          {
            show &&
            <React.Fragment>{ controls }</React.Fragment>
          }
        </div>
      }
    </React.Fragment>
  )
}

export default SearchFilters;
