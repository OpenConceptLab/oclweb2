import React from 'react';
import { min, isNaN, get } from 'lodash';
import { DEFAULT_LIMIT } from '../../common/constants';

class PageResultsLabel extends React.Component {
  getPageRange() {
    const { results, limit, isInfinite } = this.props;
    const total = get(results, 'total', 0)
    let _limit = limit || DEFAULT_LIMIT;

    if(total === 0)
      return [0, 0]

    const page = get(results, 'pageNumber') || 1
    const resultsInCurrentPage = min([(total - (_limit * (page-1))), _limit])
    let start = ((page - 1) * _limit) + 1;
    let end = start + resultsInCurrentPage - 1;

    if(isNaN(start)) start = 0;
    if(isNaN(end)) end = 0;

    if(isInfinite)
      start = 1

    return [start, end]
  }

  render() {
    const { results } = this.props;
    const pageRange = this.getPageRange()
    return (
      <span style={{fontSize: '12px'}}>
        <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{`${pageRange[0]}-${pageRange[1]}`}</span>
        <span style={{paddingRight: '4px'}}>of</span>
        <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{get(results, 'total', 0).toLocaleString()}</span>
      </span>
    )
  }
}

export default PageResultsLabel;
