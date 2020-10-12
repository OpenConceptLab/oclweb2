import React from 'react';
import { Divider, CircularProgress } from '@material-ui/core';
import { map, startCase} from 'lodash';
import Concept from './Concept';
import Mapping from './Mapping';
import { BLUE } from '../../common/constants';
import InfiniteScroll from 'react-infinite-scroll-component';

const ResultsInfinite = props => {
  const getComponentFor = data => {
    const { resource } = props;
    if(resource === 'concepts')
      return <Concept {...data} />;
    if(resource === 'mappings')
      return <Mapping {...data} />
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
