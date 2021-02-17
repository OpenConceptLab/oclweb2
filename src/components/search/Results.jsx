import React from 'react';
import { Pagination } from '@material-ui/lab'
import { map, startCase, uniq, without, filter, includes, isEmpty } from 'lodash';
import RowComponent from './RowComponent';
import SelectedResourceControls from './SelectedResourceControls';

const Results = props => {
  const { resource, results, viewFields, onPageChange, onCreateSimilarClick, onCreateMappingClick } = props;
  const [selectedList, setSelectedList] = React.useState([]);

  const onSelectChange = (event, id) => {
    const newSelectedList = event.target.checked ? uniq([...selectedList, id]) : without(selectedList, id);

    setSelectedList(newSelectedList)

    if (props.onSelectChange) props.onSelectChange(newSelectedList);
  }

  const selectedItemObjects = filter(results.items, item => includes(selectedList, item.url));
  return (
    <div className='col-sm-12 no-side-padding'>
      {
        !isEmpty(selectedItemObjects) &&
        <div className='col-sm-12' style={{padding: '10px', background: 'rgba(0, 0, 0, 0.1)', borderRadius: '4px'}}>
          <SelectedResourceControls
            selectedItems={selectedItemObjects}
            resource={resource}
            onCreateSimilarClick={onCreateSimilarClick}
            onCreateMappingClick={onCreateMappingClick}
          />
        </div>
      }
      {
        results.total ?
        <div className='col-sm-12 no-side-padding'>
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
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center', marginTop: '10px'}}>
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
