import React from 'react';
import { Paper, TableContainer, Table, TableHead, TableBody, TableCell, TableRow, TableFooter } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase } from 'lodash';
import Concept from './Concept';
import Mapping from './Mapping';
import { PAGE_LIMIT } from '../../common/constants';
import ResourceLabel from './ResourceLabel';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';


const ResultsTable = props => {

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

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        props.results.total ?
        <div className='col-sm-12 no-side-padding search-results'>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead>
                <TableCell align='left'>Name</TableCell>
                <TableCell align='left'>Class</TableCell>
                <TableCell align='left'>Datatype</TableCell>
                <TableCell align='left'>Updated On</TableCell>
              </TableHead>
              <TableBody>
                {
                  map(props.results.items, item => (
                    <TableRow hover key={item.id}>
                      <TableCell align='left'>
                        <ResourceLabel
                          owner={item.owner}
                          parent={item.source}
                          id={item.display_name}
                          name={item.id}
                        />
                      </TableCell>
                      <TableCell align='left'>{item.concept_class}</TableCell>
                      <TableCell align='left'>{item.datatype}</TableCell>
                      <TableCell align='left'>
                        <LastUpdatedOnLabel date={item.version_created_on} />
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
          <div className='col-sm-12 no-side-padding pagination' style={{textAlign: 'center', marginTop: '10px'}}>
            <Pagination
              onChange={onPageChange}
              count={props.results.pages}
              variant="outlined"
              shape="rounded"
              color="primary"
              showFirstButton
              showLastButton
              page={props.results.pageNumber}
            />
          </div>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(props.resource)}.</div>
      }
    </div>
  )
}

export default ResultsTable
