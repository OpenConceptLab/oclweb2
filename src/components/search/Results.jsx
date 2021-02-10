import React from 'react';
import { Pagination } from '@material-ui/lab'
import { map, startCase, uniq, without } from 'lodash';
import RowComponent from './RowComponent';

const Results = props => {
  const { resource, results, viewFields, onPageChange } = props;
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
            map(
              results.items,
              item => <RowComponent
                        key={item.uuid || item.id}
                        onSelect={onSelectChange}
                        item={item}
                        resource={resource}
                        viewFields={viewFields}
              />
            )
          }
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center', marginTop: '10px', width: '100%'}}>
            <Pagination
              onChange={(event, page) => onPageChange(page)}
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
