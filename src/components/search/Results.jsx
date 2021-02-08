import React from 'react';
import { Pagination } from '@material-ui/lab'
import { map, startCase, includes, uniq, without } from 'lodash';
import RowComponent from './RowComponent';

const Results = props => {
  const { resource, results } = props;
  const [selectedList, setSelectedList] = React.useState([]);

  const onSelectChange = (event, id) => {
    const newSelectedList = event.target.checked ? uniq([...selectedList, id]) : without(selectedList, id);

    setSelectedList(newSelectedList)

    if (props.onSelectChange) props.onSelectChange(newSelectedList);
  }

  return (
    <div className='col-sm-12 no-side-padding' style={{width: '100%'}}>
      {
        results.total ?
        <div className='col-sm-12 no-side-padding' style={{width: '100%'}}>
          {
            includes(['concepts', 'mappings', 'sources', 'collections'], resource) ?
            map(
              results.items,
              item => <RowComponent
                        key={item.uuid || item.id}
                        onSelect={onSelectChange}
                        item={item}
                        resource={resource} />
            ) :
            <div
              className="col-sm-12 no-side-padding"
              style={{textAlign: 'center', margin: '10px 0', width: '100%'}}>
              {`This view is not implemented yet for ${startCase(props.resource)}`}
            </div>
          }
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center', marginTop: '10px', width: '100%'}}>
            <Pagination
              onChange={(event, page) => props.onPageChange(page)}
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
