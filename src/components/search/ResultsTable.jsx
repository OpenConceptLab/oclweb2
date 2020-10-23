import React from 'react';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Paper, Tabs, Tab, Checkbox, TableSortLabel, Chip
} from '@material-ui/core';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LocalOffer as LocalOfferIcon,
  Link as LinkIcon, List as ListIcon,
  Loyalty as LoyaltyIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  AcUnit as AsteriskIcon,
} from '@material-ui/icons'
import { Pagination } from '@material-ui/lab'
import { map, startCase, get, without, uniq, includes, find, keys, values } from 'lodash';
import { BLUE, WHITE, DARKGRAY, COLOR_ROW_SELECTED, ORANGE, GREEN } from '../../common/constants';
import { formatDate, formatDateTime } from '../../common/utils';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';
import APIService from '../../services/APIService';

const RESOURCE_DEFINITIONS = {
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'display_name', sortOn: 'id'},
      {id: 'name', label: 'Name', value: 'id', sortOn: 'name'},
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source', sortOn: 'source'},
      {id: 'class', label: 'Class', value: 'concept_class', sortOn: 'concept_class'},
      {id: 'datatype', label: 'Datatype', value: 'datatype', sortOn: 'datatype'},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    expandible: true,
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner'},
      {id: 'parent', label: 'Parent', value: 'source', sortOn: 'source'},
      {id: 'from', label: 'From', renderer: (mapping) => <FromConceptLabel {...mapping} />},
      {id: 'mapType', label: 'Map Type', value: 'map_type', sortOn: 'map_type'},
      {id: 'to', label: 'To', renderer: (mapping) => <ToConceptLabel {...mapping} />},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    expandible: true,
  },
  sources: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'shortCode', label: 'Short Code', value: 'short_code', sortable: false},
      {id: 'sourceType', label: 'Source Type', value: 'source_type', sortOn: 'source_type'},
      {id: 'updatedOn', label: 'Updated On', value: 'updated_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    tags: [
      {id: 'activeConcepts', value: 'active_concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'activeMappings', value: 'active_mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'versions', value: 'versions', label: 'Versions', icon: <AsteriskIcon fontSize='small' style={{width: '12px'}} />},
    ],
    expandible: true,
  },
  collections: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'shortCode', label: 'Short Code', value: 'short_code', sortOn: 'name'},
      {id: 'collectionType', label: 'Collection Type', value: 'collection_type', sortOn: 'collection_type'},
      {id: 'updatedOn', label: 'Updated On', value: 'updated_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    expandible: true,
  },
  organizations: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'createdOn', label: 'Created On', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
    ],
    expandible: false,
  },
  users: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'username', label: 'Username', value: 'username', sortOn: 'username'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'company', label: 'Company', value: 'company', sortOn: 'company'},
      {id: 'location', label: 'Location', value: 'location', sortOn: 'Location'},
      {id: 'createdOn', label: 'Joined On', value: 'created_on', formatter: formatDate, sortOn: 'date_joined'},
    ],
    expandible: false,
  },
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
            <TableRow hover key={version.uuid}>
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
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + (resourceDefinition.expandible ? 2 : 1)

  const onClick = event => {
    event.stopPropagation()
    event.preventDefault()

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

  const onCheckboxClick = event => {
    props.onSelectChange(item.id, event.target.checked)
  }

  return (
    <React.Fragment>
      <TableRow
        hover
        style={props.isSelected ? {backgroundColor: COLOR_ROW_SELECTED, cursor: 'pointer'} : {cursor: 'pointer'}}
        onClick={onClick}>
        {
          props.isSelecteable &&
          <TableCell>
            <Checkbox checked={props.isSelected} onChange={onCheckboxClick} />
          </TableCell>
        }
        {
          map(resourceDefinition.columns, column => (
            <TableCell key={column.id} align='left'>
              { getValue(item, column) || 'None' }
            </TableCell>
          ))
        }
        {
          !props.isSelecteable &&
          <TableCell align='center' style={{width: '120px', padding: '2px'}}>
            {
              map(resourceDefinition.tags, tag => (
                <Chip
                  size='small' label={`${get(item, tag.value, '0')} ${tag.label}`} color='primary'
                  variant='outlined'
                  style={{fontSize: '12px', width: '100%', marginTop: '2px'}}
                />
              ))
            }
          </TableCell>
        }
        {
          resourceDefinition.expandible &&
          <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={onClick}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          </TableCell>
        }
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columnsCount}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Paper square style={{boxShadow: 'none', border: '1px solid lightgray'}}>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={handleTabChange}
                >
                  <Tab label="Versions" style={{fontSize: '12px', fontWeight: 'bold'}} />
                  <Tab label="Mappings" style={{fontSize: '12px', fontWeight: 'bold'}} />
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

const ResultsTable = ({resource, results, onPageChange, onSortChange, sortParams}) => {
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
    border: `1px solid ${theadBgColor}`,
  }
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + (resourceDefinition.expandible ? 2 : 1);
  const canRender = results.total && resourceDefinition;
  const defaultOrderBy = get(find(resourceDefinition.columns, {sortOn: get(values(sortParams), '0', 'last_update')}), 'id', 'UpdateOn');
  const defaultOrder = get(keys(sortParams), '0') === 'sortAsc' ? 'asc' : 'desc';
  const [selectedList, setSelectedList] = React.useState([]);
  const [orderBy, setOrderBy] = React.useState(defaultOrderBy)
  const [order, setOrder] = React.useState(defaultOrder)
  const isSelecteable = includes(['concepts', 'mappings'], resource);

  const onAllSelect = event => {
    if(event.target.checked)
      setSelectedList(map(results.items, 'id'))
    else
      setSelectedList([])
  }

  const updateSelected = (id, selected) => {
    if(selected)
      setSelectedList(uniq([...selectedList, id]))
    else
      setSelectedList(without(selectedList, id))
  }

  const getOppositeOrder = order => {
    return order === 'asc' ? 'desc' : 'asc';
  }

  const onSort = (event, columnId) => {
    let newOrder = 'desc';
    if(orderBy === columnId)
      newOrder = getOppositeOrder(order)

    const sortOn = get(find(resourceDefinition.columns, {id: columnId}), 'sortOn', 'last_update')
    let sortQuery = {sortDesc: sortOn}
    if(newOrder === 'asc')
      sortQuery = {sortAsc: sortOn}

    setOrder(newOrder)
    setOrderBy(columnId)
    onSortChange(sortQuery)
  }

  return (
    <div className='col-sm-12 no-side-padding'>
      {
        canRender ?
        <div className='col-sm-12 no-side-padding search-results'>
          <TableContainer style={{borderRadius: '4px'}}>
            <Table size='small'>
              <TableHead style={theadStyles}>
                {
                  selectedList.length > 0 &&
                  <TableRow colSpan={columnsCount} style={{backgroundColor: DARKGRAY, border: `1px solid ${DARKGRAY}`}}>
                    <TableCell colSpan={columnsCount} align='left' style={{color: WHITE}}>
                      {selectedList.length} Selected
                    </TableCell>
                  </TableRow>
                }
                <TableRow>
                  {
                    isSelecteable &&
                    <TableCell>
                      <Checkbox style={{color: theadTextColor}} onChange={onAllSelect} />
                    </TableCell>
                  }
                  {
                    map(resourceDefinition.columns, column => {
                      const isSortable = column.sortable !== false;
                      return isSortable ? (
                        <TableCell
                          key={column.id}
                          sortDirection={orderBy === column.id ? order : false}
                          align='left'
                          style={{color: theadTextColor}}>
                          <TableSortLabel
                            className='table-sort-label-white'
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'desc'}
                            onClick={(event) => onSort(event, column.id)}
                            style={{color: theadTextColor}}
                          >
                            { column.label }
                          </TableSortLabel>
                        </TableCell>
                      ) : (
                        <TableCell key={column.id} align='left' style={{color: theadTextColor}}>
                          {column.label}
                        </TableCell>
                      )
                    })
                  }
                  {
                    !isSelecteable &&
                    <TableCell />
                  }
                  {
                    resourceDefinition.expandible &&
                    <TableCell />
                  }
                </TableRow>
              </TableHead>
              <TableBody style={{border: '1px solid lightgray'}}>
                {
                  map(results.items, item => (
                    <ExpandibleRow
                      key={item.id}
                      item={item}
                      resourceDefinition={resourceDefinition}
                      isSelected={includes(selectedList, item.id)}
                      onSelectChange={updateSelected}
                      isSelecteable={isSelecteable}
                    />
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
