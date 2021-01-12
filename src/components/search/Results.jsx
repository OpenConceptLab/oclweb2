import React from 'react';
import { Divider } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase, includes } from 'lodash';
import Concept from '../concepts/Concept';
import Mapping from '../mappings/Mapping';

const Results = props => {
  const { resource, results } = props;

  const getComponentFor = data => {
    if(resource === 'concepts')
      return <Concept {...data} style={{paddingLeft: '10px'}} />;
    if(resource === 'mappings')
      return <Mapping {...data} style={{paddingLeft: '10px'}} />
  }

  const onPageChange = (event, page) => {
    props.onPageChange(page)
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        results.total ?
        <div className='col-sm-12 no-side-padding'>
          {
            includes(['concepts', 'mappings'], resource) ?
            map(results.items, item => (
              <div className='col-sm-12 no-side-padding' key={item.id}>
                {getComponentFor(item)}
                <Divider style={{width: '100%'}} />
              </div>
            )) :
            <div className="col-sm-12 no-side-padding" style={{textAlign: 'center', margin: '10px 0'}}>
              {`This view is not implemented yet for ${startCase(props.resource)}`}
            </div>
          }
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center'}}>
            <Pagination
              onChange={onPageChange}
              count={results.pages}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
              page={results.pageNumber}
            />
          </div>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(resource)}.</div>
      }
    </div>
  )
}

export default Results
