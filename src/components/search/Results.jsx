import React from 'react';
import { Divider } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase } from 'lodash';
import Concept from '../concepts/Concept';
import Mapping from '../mappings/Mapping';

const Results = props => {
  const getComponentFor = data => {
    const { resource } = props;
    if(resource === 'concepts')
      return <Concept {...data} />;
    if(resource === 'mappings')
      return <Mapping {...data} />
  }

  const onPageChange = (event, page) => {
    props.onPageChange(page)
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        props.results.total ?
        <div className='col-sm-12 no-side-padding'>
          {
            map(props.results.items, item => (
              <div className='col-sm-12 no-side-padding' key={item.id}>
                {getComponentFor(item)}
                <Divider style={{width: '100%'}} />
              </div>
            ))
          }
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center'}}>
            <Pagination
              onChange={onPageChange}
              count={props.results.pages}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
              page={props.results.pageNumber}
            />
          </div>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(props.resource)}.</div>
      }
    </div>
  )
}

export default Results
