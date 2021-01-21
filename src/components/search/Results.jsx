import React from 'react';
import { Divider, Checkbox } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase, includes, uniq, without } from 'lodash';
import Concept from '../concepts/Concept';
import Mapping from '../mappings/Mapping';

const Results = props => {
  const { resource, results } = props;
  const [selectedList, setSelectedList] = React.useState([]);

  const onSelectChange = (event, id) => {
    let newSelectedList;
    if(event.target.checked)
      newSelectedList = uniq([...selectedList, id])
    else
      newSelectedList = without(selectedList, id)

    setSelectedList(newSelectedList)

    if (props.onSelectChange) props.onSelectChange(newSelectedList);
  }

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
    <div className='col-sm-12 no-side-padding' style={{width: '100%'}}>
      {
        results.total ?
        <div className='col-sm-12 no-side-padding' style={{width: '100%'}}>
          {
            includes(['concepts', 'mappings'], resource) ?
            map(results.items, item => (
              <div className='col-sm-12 no-side-padding' key={item.id} style={{width: '100%'}}>
                <div className='col-sm-1 no-left-padding' style={{textAlign: 'right', width: '2%'}}>
                  <Checkbox onChange={event => onSelectChange(event, item.url)} />
                </div>
                <div className='col-sm-11 no-right-padding'>
                  {getComponentFor(item)}
                </div>
                <Divider style={{width: '100%'}} />
              </div>
            )) :
            <div className="col-sm-12 no-side-padding" style={{textAlign: 'center', margin: '10px 0', width: '100%'}}>
              {`This view is not implemented yet for ${startCase(props.resource)}`}
            </div>
          }
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center', marginTop: '10px', width: '100%'}}>
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
