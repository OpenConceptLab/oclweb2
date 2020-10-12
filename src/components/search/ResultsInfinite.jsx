import React from 'react';
import { Divider, CircularProgress } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase, get } from 'lodash';
import Concept from './Concept';
import Mapping from './Mapping';
import { PAGE_LIMIT, BLUE } from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroll-component';

const ResultsInfinite = props => {

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

  const prepareItems = () => {
    const { results } = props;
    return map(
      get(results, 'items', []),
      item => {
        return (
          <div className='col-sm-12 no-side-padding' key={item.id}>
            <Divider />
            {getComponentFor(item)}
          </div>
        )
      }
    )
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        props.results.total ?
        <div className='col-sm-12 no-side-padding'>
          <InfiniteScroll
            dataLength={props.results.items.length}
            next={props.onLoadMore}
            hasMore={props.results.items.length !== props.results.total}
            loader={<CircularProgress style={{color: BLUE}}/>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {
              map(props.results.items, item => (
                <div className='col-sm-12 no-side-padding' key={item.id}>
                  <Divider />
                  {getComponentFor(item)}
                </div>
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
