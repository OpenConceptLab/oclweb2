import React from 'react';
import moment from 'moment';
import { Paper, TableContainer, Table, TableHead, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Pagination } from '@material-ui/lab'
import { map, startCase } from 'lodash';
import Concept from './Concept';
import Mapping from './Mapping';
import { PAGE_LIMIT } from '../../common/constants';
import ResourceLabel from './ResourceLabel';


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
                      <TableCell component="th" scope="row" align='left'>
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
                        {moment(item.version_created_on).format('MM/DD/YYYY')}
                      </TableCell>
                    </TableRow>
                  ))
                }
                <TableRow colspan='4'>
                  <TableCell colspan='4' align='center' className='pagination-center'>
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
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(props.resource)}.</div>
      }
    </div>
  )
}

export default ResultsTable
