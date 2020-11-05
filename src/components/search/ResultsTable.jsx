import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Paper, Tabs, Tab, Checkbox, TableSortLabel, Chip, Tooltip,
} from '@material-ui/core';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LocalOffer as LocalOfferIcon,
  Link as LinkIcon,
  AcUnit as AsteriskIcon,
  Flag as FlagIcon,
  ArrowForward as ForwardIcon,
  FileCopy as CopyIcon,
  Public as PublicIcon,
} from '@material-ui/icons'
import { Pagination } from '@material-ui/lab'
import {
  map, startCase, get, without, uniq, includes, find, keys, values, isEmpty,
} from 'lodash';
import {
  BLUE, WHITE, DARKGRAY, COLOR_ROW_SELECTED, ORANGE, GREEN, EMPTY_VALUE
} from '../../common/constants';
import {
  formatDate, formatDateTime, getIndirectMappings, getDirectMappings, toFullURL
} from '../../common/utils';
import OwnerChip from '../common/OwnerChip';
import ReleasedChip from '../common/ReleasedChip';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';
import NestedMappingsTable from '../mappings/NestedMappingsTable';
import APIService from '../../services/APIService';

const RESOURCE_DEFINITIONS = {
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: concept => <OwnerChip ownerType={concept.owner_type} owner={concept.owner} />},
      {id: 'parent', label: 'Source', value: 'source', sortOn: 'source'},
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'name', label: 'Name', value: 'display_name', sortOn: 'name'},
      {id: 'class', label: 'Class', value: 'concept_class', sortOn: 'concept_class'},
      {id: 'datatype', label: 'Datatype', value: 'datatype', sortOn: 'datatype'},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    tabs: ['Mappings', 'Synonyms', 'Descriptions', 'History',],
    expandible: true,
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: mapping => <OwnerChip ownerType={mapping.owner_type} owner={mapping.owner} />},
      {id: 'parent', label: 'Source', value: 'source', sortOn: 'source'},
      {id: 'id', label: 'ID', value: 'id', sortOn: 'id'},
      {id: 'from', label: 'From Concept', renderer: (mapping) => <FromConceptLabel {...mapping} />},
      {id: 'mapType', label: 'Map Type', value: 'map_type', sortOn: 'map_type'},
      {id: 'to', label: 'To Concept', renderer: (mapping) => <ToConceptLabel {...mapping} />},
      {id: 'updatedOn', label: 'Updated On', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
    ],
    tabs: ['History',],
    expandible: true,
  },
  sources: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: source => <OwnerChip ownerType={source.owner_type} owner={source.owner} />},
      {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'sourceType', label: 'Source Type', value: 'source_type', sortOn: 'source_type'},
    ],
    tags: [
      {id: 'activeConcepts', value: 'active_concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'activeMappings', value: 'active_mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'versions', value: 'versions', label: 'Versions', icon: <AsteriskIcon fontSize='small' style={{width: '12px'}} />},
    ],
    tabs: ['History',],
    expandible: true,
  },
  collections: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: [
      {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: coll => <OwnerChip ownerType={coll.owner_type} owner={coll.owner} />},
      {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'collectionType', label: 'Collection Type', value: 'collection_type', sortOn: 'collection_type'},
    ],
    tags: [
      {id: 'activeConcepts', value: 'active_concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'activeMappings', value: 'active_mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={{width: '12px'}} />},
      {id: 'versions', value: 'versions', label: 'Versions', icon: <AsteriskIcon fontSize='small' style={{width: '12px'}} />},
    ],
    tabs: ['History',],
    expandible: true,
  },
  organizations: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'id', label: 'ID', value: 'id', sortOn: 'mnemonic', renderer: org => <OwnerChip ownerType='Organization' owner={org.id} />},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'createdOn', label: 'Created On', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
    ],
    tags: [
      {id: 'members', value: 'members', label: 'Members'},
      {id: 'sources', value: 'public_sources', label: 'Public Sources'},
      {id: 'collections', value: 'public_collections', label: 'Public Collections'},
    ],
    expandible: false,
  },
  users: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: [
      {id: 'username', label: 'Username', value: 'username', sortOn: 'username', renderer: user => <OwnerChip ownerType='user' owner={user.username} />},
      {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
      {id: 'createdOn', label: 'Joined On', value: 'created_on', formatter: formatDate, sortOn: 'date_joined'},
    ],
    tags: [
      {id: 'orgs', value: 'orgs', label: 'Organization Membership'},
      {id: 'sources', value: 'public_sources', label: 'Public Sources'},
      {id: 'collections', value: 'public_collections', label: 'Public Collections'},
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

const getMappingsHeader = (mappings, isDirect) => {
  const count = mappings.length;
  const label = `${isDirect ? 'Direct' : 'Inverse'} Mappings (${count})`
  return label;
}

const MappingsTable = ({ mappings, concept }) => {
  const directMappings = getDirectMappings(mappings, concept);
  const indirectMappings = getIndirectMappings(mappings, concept);
  const directMappingsHeader = getMappingsHeader(directMappings, true);
  const indirectMappingsHeader = getMappingsHeader(indirectMappings);
  const zeroMappings = isEmpty(mappings);

  const getMappingsDom = (mappings, header) => {
    const isPresent = !isEmpty(mappings);
    return (
      <div className='col-sm-6' style={
        (isPresent || zeroMappings) ? {marginBottom: '10px'} : {}
      }>
        <h4 style={{background: 'lightgray', padding: "10px", marginTop: '10px', marginBottom: '0px'}}>
          { header }
        </h4>
        {
          isPresent &&
          <NestedMappingsTable mappings={mappings} />
        }
      </div>
    );
  }

  return (
    <div>
      { getMappingsDom(directMappings, directMappingsHeader) }
      { getMappingsDom(indirectMappings, indirectMappingsHeader) }
    </div>
  );
}

const HistoryTable = ({ versions }) => {
  return (
    <Table size="small" aria-label="versions">
      <TableHead>
        <TableRow>
          <TableCell align='center'>Version</TableCell>
          <TableCell align='left'>Comment/Description</TableCell>
          <TableCell align='left'>Created By</TableCell>
          <TableCell align='left'>Created On</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(versions, version => (
            <TableRow hover key={version.uuid || version.id}>
              <TableCell align='center'>
                { version.uuid || version.id }
              </TableCell>
              <TableCell align='left'>
                { version.update_comment || version.description }
              </TableCell>
              <TableCell align='left'>
                { version.version_created_by }
              </TableCell>
              <TableCell align='left'>
                { formatDateTime(version.version_created_on || version.created_at) }
              </TableCell>
              {
                version.released ?
                <TableCell align='center'><ReleasedChip /></TableCell> :
                <TableCell />
              }
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
}

const LocalesTable = ({ locales, isDescription }) => {
  const nameAttr = isDescription ? 'description' : 'name';
  const typeAttr = isDescription ? 'description_type' : 'name_type';
  return (
    <Table size="small" aria-label="locales">
      <TableHead>
        <TableRow>
          <TableCell align='right'>ID</TableCell>
          <TableCell align='left'>Type</TableCell>
          <TableCell align='left'>{startCase(nameAttr)}</TableCell>
          <TableCell align='left'>External ID</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          isEmpty(locales) ?
          <TableRow colSpan='5'>
            <TableCell colSpan='6' align='center'>No Records</TableCell>
          </TableRow> :
          map(locales, locale => (
            <TableRow hover key={locale.uuid}>
              <TableCell align='right' style={{width: '100px'}}>
                <span className='flex-vertical-center'>
                  {
                    locale.locale_preferred &&
                    <span style={{marginRight: '5px'}}>
                      <Tooltip title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
                        <FlagIcon color='secondary' fontSize='small' style={{width: '18px', marginTop: '4px'}}/>
                      </Tooltip>
                    </span>
                  }
                  {
                    locale.external_id &&
                    <span style={{marginRight: '5px'}}>
                      <Tooltip title={`External ID: ${locale.external_id}`} placement='top-start'>
                        <ForwardIcon
                          fontSize='small'
                          color='secondary'
                          style={{
                            border: '1px solid', borderRadius: '10px',
                            background: 'gray', color: 'white',
                            width: '18px',
                            height: '18px',
                            marginTop: '4px'
                          }}
                        />
                      </Tooltip>
                    </span>
                  }
                  <span> { locale.uuid } </span>
                </span>
              </TableCell>
              <TableCell align='left'>{ startCase(get(locale, typeAttr)) || EMPTY_VALUE }</TableCell>
              <TableCell align='left' className='ellipsis-text'>
                <span className='gray-italics-small'>{`[${locale.locale}]`}</span>
                <span>{ get(locale, nameAttr) }</span>
              </TableCell>
              <TableCell align='left'>{ locale.external_id || EMPTY_VALUE }</TableCell>
            </TableRow>
          ))
        }
      </TableBody>
    </Table>
  );
}

const ExpandibleRow = props => {
  const { item, resourceDefinition } = props;
  const [mappings, setMappings] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [names, setNames] = React.useState([]);
  const [descriptions, setDescriptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState(0);
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + (resourceDefinition.expandible ? 2 : 1)

  const onClick = event => {
    if(!resourceDefinition.expandible)
      return;

    event.stopPropagation()
    event.preventDefault()

    setOpen(prevOpen => {
      const newOpen = !prevOpen
      if(newOpen) {
        fetchVersions();
        if(props.resource === 'concepts') {
          fetchNames();
          fetchDescriptions();
          fetchMappings();
        }
      }
      return newOpen
    })
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const fetchVersions = () => {
    if(item.url) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('versions/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setVersions(response.data)
                })
    }
  }
  const fetchNames = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('names/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setNames(response.data)
                })
    }
  }

  const fetchDescriptions = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('descriptions/')
                .get()
                .then(response => {
                  if(response.status === 200)
                    setDescriptions(response.data)
                })
    }
  }

  const fetchMappings = () => {
    if(item) {
      APIService.new().overrideURL(item.url)
                .appendToUrl('mappings/')
                .get(null, null, {includeInverseMappings: true})
                .then(response => {
                  if(response.status === 200)
                    setMappings(response.data)
                })
    }
  }

  const onCheckboxClick = event => {
    event.stopPropagation();
    event.preventDefault();
    props.onSelectChange(item.id, event.target.checked);
  }

  const onCopyClick = event => {
    event.stopPropagation();
    event.preventDefault();
    if(item.url) {
      navigator.clipboard.writeText(toFullURL(item.url));
      alertifyjs.success('Copied URL to clipboard!')
    }
  }

  const getTab = label => {
    return (
      <Tab key={label} label={label} style={{fontSize: '12px', fontWeight: 'bold'}} />
    )
  }

  const isPublic = includes(['view', 'edit'], get(item, 'public_access', '').toLowerCase());
  const showPublicIndicator = includes(['sources', 'collections'], props.resource);

  return (
    <React.Fragment>
      <TableRow
        hover
        style={props.isSelected ? {backgroundColor: COLOR_ROW_SELECTED, cursor: 'pointer'} : {cursor: 'pointer'}}
        onClick={onClick}>
        <TableCell align={showPublicIndicator ? 'right' : 'center'}>
          <span className='flex-vertical-center'>
            {
              showPublicIndicator && isPublic &&
              <Tooltip title='Public'>
                <PublicIcon fontSize='small' />
              </Tooltip>
            }
          <Tooltip title='Copy URL'>
            <IconButton aria-label="copy" size="small" onClick={onCopyClick} color='primary' style={showPublicIndicator ? {padding: '10px'} : {}}>
              <CopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          </span>
        </TableCell>
        {
          props.isSelecteable &&
          <TableCell>
            <Checkbox checked={props.isSelected} onChange={onCheckboxClick} />
          </TableCell>
        }
        {
          map(resourceDefinition.columns, column => (
            <TableCell key={column.id} align={column.align || 'left'}>
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
                  key={tag.label}
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
      {
        resourceDefinition.expandible &&
        <TableRow>
          <TableCell style={{ padding: 0 }} colSpan={columnsCount}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Paper square style={{boxShadow: 'none', border: '1px solid lightgray'}}>
                  <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleTabChange}
                  >
                    {
                      map(resourceDefinition.tabs, label => getTab(label))
                    }
                  </Tabs>
                  {
                    tab === resourceDefinition.tabs.indexOf('Mappings') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <MappingsTable mappings={mappings} concept={item.id}/>
                    </div>
                  }
                  {
                    tab === resourceDefinition.tabs.indexOf('Synonyms') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <LocalesTable locales={names} />
                    </div>
                  }
                  {
                    tab === resourceDefinition.tabs.indexOf('Descriptions') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <LocalesTable locales={descriptions} isDescription={true} />
                    </div>
                  }
                  {
                    tab === resourceDefinition.tabs.indexOf('History') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <HistoryTable versions={versions} />
                    </div>
                  }
                </Paper>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      }
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
  const columnsCount = get(resourceDefinition, 'columns.length', 1) + (resourceDefinition.expandible ? 3 : 2);
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
                  <TableCell />
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
                          align={column.align || 'left'}
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
              <TableBody>
                {
                  map(results.items, item => (
                    <ExpandibleRow
                      key={item.id}
                      item={item}
                      resource={resource}
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
