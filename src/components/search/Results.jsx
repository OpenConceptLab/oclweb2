import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase, uniq, without, filter, includes, isEmpty, get } from 'lodash';
import RowComponent from './RowComponent';
import SelectedResourceControls from './SelectedResourceControls';
import InfiniteScroll from 'react-infinite-scroll-component';

const Results = props => {
  const {
    resource, results, viewFields, onPageChange, onCreateSimilarClick, onCreateMappingClick,
    onLoadMore, isInfinite, noControls,
  } = props;
  const items = get(results, 'items', [])
  const count = get(items, 'length', 0)
  const total = get(results, 'total', 0)
  const [selectedList, setSelectedList] = React.useState([]);
  const onSelectChange = (event, id) => {
    const newSelectedList = event.target.checked ?
                            uniq([...selectedList, id]) :
                            without(selectedList, id);
    setSelectedList(newSelectedList)
    if (props.onSelectChange)
      props.onSelectChange(newSelectedList);
  }
  const selectedItemObjects = filter(items, item => includes(selectedList, item.url));
  const resultDOM = () => map(
    items,
    item => <RowComponent
              key={item.uuid || item.id} onSelect={onSelectChange}
              item={item} resource={resource} viewFields={viewFields}
    />
  )
  const infiniteResults = () => (
      <InfiniteScroll
        dataLength={count}
        next={onLoadMore}
        hasMore={count !== total}
        loader={<CircularProgress />}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have reached end of results!</b>
          </p>
        }
      >
        { resultDOM() }
      </InfiniteScroll>
  )

  const paginatedResults = () => (
    <React.Fragment>
      { resultDOM() }
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
    </React.Fragment>
  )

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        !isEmpty(selectedItemObjects) && !noControls &&
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
        total ?
        <div className='col-sm-12 no-side-padding'>
          { isInfinite ? infiniteResults() : paginatedResults() }
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(resource)}.</div>
      }
    </div>
  )
}

export default Results
