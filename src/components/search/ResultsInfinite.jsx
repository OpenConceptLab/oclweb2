import React from 'react';
import { CircularProgress } from '@material-ui/core';
import { map, startCase, get, uniq, without, filter, includes, isEmpty } from 'lodash';
import { BLUE } from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroll-component';
import RowComponent from './RowComponent';
import SelectedResourceControls from './SelectedResourceControls';

const ResultsInfinite = props => {
  const { results, onLoadMore, resource, viewFields, onCreateSimilarClick, onCreateMappingClick } = props;
  const [selectedList, setSelectedList] = React.useState([]);
  const onSelectChange = (event, id) => {
    const newSelectedList = event.target.checked ? uniq([...selectedList, id]) : without(selectedList, id);

    setSelectedList(newSelectedList)

    if (props.onSelectChange) props.onSelectChange(newSelectedList);
  }

  const items = get(results, 'items', [])
  const count = get(items, 'length', 0)
  const total = get(results, 'total', 0)
  const selectedItemObjects = filter(items, item => includes(selectedList, item.url));

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
        total ?
        <div className='col-sm-12 no-side-padding'>
          <InfiniteScroll
            dataLength={count}
            next={onLoadMore}
            hasMore={count !== total}
            loader={<CircularProgress style={{color: BLUE}}/>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>You have reached end of results!</b>
              </p>
            }
          >
            {
              map(results.items, item => (
                <RowComponent
                  key={item.id} onSelect={onSelectChange} item={item} resource={resource}
                  viewFields={viewFields}
                />
              ))
            }
          </InfiniteScroll>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(props.resource)}.</div>
      }
    </div>
  )
}

export default ResultsInfinite
