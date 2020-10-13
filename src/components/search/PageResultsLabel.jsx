import React from 'react';
import { min, isNaN, startCase } from 'lodash';
const LIMIT = 25;

class PageResultsLabel extends React.Component {

  getPageRange() {
    const { results } = this.props;

    const total = results.total
    if(total === 0)
      return [0, 0]
    const page = results.pageNumber || 1
    const resultsInCurrentPage = min([(total - (25 * (page-1))), LIMIT])
    let start = ((page - 1) * LIMIT) + 1;
    let end = start + resultsInCurrentPage - 1;

    if(isNaN(start)) start = 0;
    if(isNaN(end)) end = 0;

    return [start, end]
  }

  render() {
    const { resource, results } = this.props;
    const pageRange = this.getPageRange()
    return (
      <span style={{fontSize: '12px'}}>
        <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{`${pageRange[0]}-${pageRange[1]}`}</span>
        <span style={{paddingRight: '4px'}}>of</span>
        <span style={{fontWeight: 'bold', paddingRight: '4px'}}>{results.total.toLocaleString()}</span>
        <span>{startCase(resource)}</span>
      </span>
    )
  }
}

export default PageResultsLabel;
