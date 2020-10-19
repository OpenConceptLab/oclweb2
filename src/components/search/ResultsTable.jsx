import React from 'react';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Paper, Tabs, Tab, Checkbox
} from '@material-ui/core';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@material-ui/icons'
import { Pagination } from '@material-ui/lab'
import { map, startCase, get } from 'lodash';
import { BLUE, WHITE } from '../../common/constants';
import { formatDate, formatDateTime } from '../../common/utils';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';
import APIService from '../../services/APIService';

const RESOURCE_DEFINITIONS = {
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'display_name'},
      {id: 'name', label: 'Name', value: 'id'},
      {id: 'owner', label: 'Owner', value: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source'},
      {id: 'class', label: 'Class', value: 'concept_class'},
      {id: 'datatype', label: 'Datatype', value: 'datatype'},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate},
    ]
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id'},
      {id: 'owner', label: 'Owner', value: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source'},
      {id: 'from', label: 'From', renderer: (mapping) => <FromConceptLabel {...mapping} />},
      {id: 'mapType', label: 'Map Type', value: 'map_type'},
      {id: 'to', label: 'To', renderer: (mapping) => <ToConceptLabel {...mapping} />},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate},
    ]
  }
}

const getValue = (item, column) => {
  const value = get(item, column.value, '')
  if(get(column, 'formatter') && value)
    return column.formatter(value)
  if(get(column, 'renderer'))
    return column.renderer(item)
  return value
}

const VersionsTable = ({ versions }) => {
  return (
    <Table size="small" aria-label="versions">
      <TableHead>
        <TableRow>
          <TableCell align='center'>Version</TableCell>
          <TableCell align='center'>Created By</TableCell>
          <TableCell align='center'>Created On</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(versions, version => (
            <TableRow hover  key={version.uuid}>
              <TableCell align='center'>
                { version.uuid }
              </TableCell>
              <TableCell align='center'>
                { version.version_created_by }
              </TableCell>
              <TableCell align='center'>
                { formatDateTime(version.version_created_on) }
              </TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
}

const ExpandibleRow = props => {
  const { item, resourceDefinition } = props;
  const [versions, setVersions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + 1

  const onClick = () => {
    setOpen(prevOpen => {
      const newOpen = !prevOpen
      if(newOpen)
        fetchVersions()
      return newOpen
    })
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchVersions = () => {
    if(item.versions_url) {
      APIService.concepts().overrideURL(item.versions_url)
                .get()
                .then(response => {
                  if(response.status === 200)
                    setVersions(response.data)
                })
    }
  }

  return (
    <React.Fragment>
      <TableRow hover>
        <TableCell>
          <Checkbox />
        </TableCell>
        {
          map(resourceDefinition.columns, column => (
            <TableCell key={column.id} align='left'>
              { getValue(item, column) }
            </TableCell>
          ))
        }
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={onClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columnsCount}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Paper square>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handleTabChange}
                >
                  <Tab label="Versions" style={{fontSize: '12px'}} />
                  <Tab label="Mappings" style={{fontSize: '12px'}} />
                </Tabs>
                {
                  tab === 0 &&
                  <div>
                    <VersionsTable versions={versions} />
                  </div>
                }
                {
                  tab === 1 && <div>Mappings</div>
                }
              </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

const ResultsTable = ({resource, results, onPageChange}) => {
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
    border: `1px solid ${theadBgColor}`,
  }
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + 1;
  const canRender = results.total && resourceDefinition;

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        canRender ?
        <div className='col-sm-12 no-side-padding search-results'>
          <TableContainer style={{borderRadius: '4px'}}>
            <Table size='small'>
              <TableHead style={theadStyles}>
                <TableRow>
                  <TableCell><Checkbox style={{color: WHITE}} /></TableCell>
                  {
                    map(resourceDefinition.columns, column => (
                      <TableCell key={column.id} align='left' style={{color: theadTextColor}}>
                        { column.label }
                      </TableCell>
                    ))
                  }
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody style={{border: '1px solid lightgray'}}>
                {
                  map(results.items, item => (
                    <ExpandibleRow key={item.id} item={item} resourceDefinition={resourceDefinition} />
                  ))
                }
                <TableRow colSpan={columnsCount}>
                  <TableCell colSpan={columnsCount} align='center' className='pagination-center'>
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
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div> :
        <div style={{padding: '2px'}}>We found 0 {startCase(resource)}.</div>
      }
    </div>
  )
}

export default ResultsTable
