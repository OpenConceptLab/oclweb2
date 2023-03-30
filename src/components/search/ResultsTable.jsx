import React from 'react';
import { Link } from 'react-router-dom';
import {
  TableContainer, Table, TableHead, TableBody, TableCell, TableRow,
  Collapse, IconButton, Box, Paper, Tabs, Tab, Checkbox, TableSortLabel, Tooltip,
  FormControlLabel, Switch, Skeleton
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Flag as FlagIcon,
  ArrowForward as ForwardIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Warning as WarningIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material'
import { TablePagination } from '@mui/material';
import {
  map, startCase, get, without, uniq, includes, find, keys, values, isEmpty, filter, reject, has,
  isFunction, compact, flatten, last, isArray, times
} from 'lodash';
import {
  BLUE, WHITE, COLOR_ROW_SELECTED, ORANGE, GREEN, EMPTY_VALUE
} from '../../common/constants';
import {
  formatDateTime, headFirst, isLoggedIn, defaultCreatePin, defaultDeletePin,
  getCurrentUserUsername, isCurrentUserMemberOf, isAdminUser, currentUserHasAccess, getAppliedServerConfig,
} from '../../common/utils';
import ReleasedChip from '../common/ReleasedChip';
import AllMappingsTables from '../mappings/AllMappingsTables';
import APIService from '../../services/APIService';
import PinIcon from '../common/PinIcon';
import MappingOptions from '../mappings/MappingOptions';
import { ALL_COLUMNS, TAGS, CODE_SYSTEM_VERSION_TAGS } from './ResultConstants'
import SelectedResourceControls from './SelectedResourceControls';
import FhirContainerResource from '../fhir/ContainerResource';

const RESOURCE_DEFINITIONS = {
  references: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.references.slice(0, 3),
  },
  concepts: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.concepts.slice(0, 7),
    tabs: ['Mappings', 'Synonyms', 'Descriptions', 'History',],
    expandible: false,
  },
  mappings: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.mappings.slice(0, 7),
    tabs: ['History',],
    expandible: false,
  },
  sources: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.sources.slice(0, 4),
    tagWaitAttribute: 'summary',
    tags: TAGS.sources,
    tabs: ['Versions',],
    expandible: false,
    pinnable: true,
  },
  collections: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.collections.slice(0, 4),
    tagWaitAttribute: 'summary',
    tags: TAGS.collections,
    tabs: ['Versions'],
    expandible: false,
    pinnable: true,
  },
  organizations: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.organizations.slice(0, 3),
    tags: TAGS.organizations,
    expandible: false,
    pinnable: true,
  },
  users: {
    headBgColor: ORANGE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.users.slice(0, 3),
    tags: TAGS.users,
    expandible: false,
  },
  CodeSystem: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.CodeSystem,
    tagWaitAttribute: 'resource',
    tags: TAGS.CodeSystem,
    expandible: true,
    tabs: ['Details', 'Versions', 'Copyright'],
  },
  ValueSet: {
    headBgColor: GREEN,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.ValueSet,
    tagWaitAttribute: 'resource',
    tags: TAGS.ValueSet,
    getTags: hapi => hapi ? TAGS.ValueSet : null,
    expandible: true,
    tabs: ['Details', 'Versions', 'Copyright'],
  },
  ConceptMap: {
    headBgColor: BLUE,
    headTextColor: WHITE,
    columns: ALL_COLUMNS.ConceptMap,
    tagWaitAttribute: 'resource',
    expandible: true,
    tabs: ['Details', 'Versions', 'Copyright'],
  },
}

const getValue = (item, column, refTranslation) => {
  const value = get(item, column.value, '')
  if(get(column, 'formatter') && value)
    return column.formatter(value)
  if(get(column, 'renderer'))
    return column.translation ? column.renderer(item, refTranslation) : column.renderer(item)
  if(isArray(value))
    return value.join(', ')
  return value
}

const getTag = (tag, item, hapi) => {
  const formatCount = count => count === null ? '-' : count.toLocaleString()
  const value = isFunction(tag.getValue) ? tag.getValue(item, hapi) : formatCount(get(item, tag.value, null));
  const icon = isFunction(tag.getIcon) ? tag.getIcon(item) : tag.icon;
  const getTagDom = () => (
    <div style={{fontSize: '14px', lineHeight: '0px', marginBottom: '2px', ...(tag.style || {})}}>
      <div className='flex-vertical-center'>
        <span>{icon}</span>
        {
          !tag.noCount &&
          <span style={{padding: '2px'}}>{value}</span>
        }
      </div>
    </div>
  );

  return (
    <React.Fragment key={tag.id}>
      {
        tag.noTooltip ?
        getTagDom() :
          <Tooltip title={tag.label} key={tag.id}>
          {
            getTagDom()
          }
        </Tooltip>
      }
    </React.Fragment>
  );
}

const FHIRHistoryTable = ({ versions, resource }) => {
  const isValueSet = resource === 'ValueSet'
  const isCodeSystem = resource === 'CodeSystem'
  const getVersionLabel = version => {
    const versionName = version.resource.version
    const changeId = get(version, 'resource.meta.versionId')
    if(isValueSet && versionName !== changeId && versionName && changeId)
      return `${versionName} (${changeId})`
    return versionName || changeId
  }

  return (
    <Table size="small" aria-label="versions">
      <TableHead>
        <TableRow>
          { isValueSet && <TableCell /> }
          <TableCell align='center'>Version</TableCell>
          <TableCell align='left'>Status</TableCell>
          <TableCell align='left'>Content</TableCell>
          <TableCell align='left'>Release Date</TableCell>
          { isCodeSystem && <TableCell /> }
        </TableRow>
      </TableHead>
      <TableBody>
        {
          map(versions, (version, index) => {
            const versionLabel = getVersionLabel(version)
            return (
              <TableRow hover key={versionLabel + '-' + index}>
                {
                  isValueSet &&
                  <TableCell align='center'>
                    <span className='flex-vertical-center'>
                      {
                        get(version, 'resource.experimental') &&
                        <Tooltip arrow title='For testing purposes, not real usage'>
                          <span className='flex-vertical-center'>
                            <WarningIcon fontSize='small' style={{marginTop: '2px'}} />
                          </span>
                        </Tooltip>
                      }
                      {
                        get(version, 'resource.immutable') &&
                        <Tooltip arrow title='Changes to the content logical definition may occur'>
                          <span className='flex-vertical-center'>
                            <PriorityIcon fontSize='small' style={{marginTop: '2px'}} />
                          </span>
                        </Tooltip>
                      }
                    </span>
                  </TableCell>
                }
                <TableCell align='center'> { versionLabel } </TableCell>
                <TableCell align='left'> { version.resource.status } </TableCell>
                <TableCell align='left'> { version.resource.content } </TableCell>
                <TableCell align='left'> { formatDateTime(version.resource.date) } </TableCell>
                {
                  isCodeSystem &&
                  <TableCell align='left'>
                    { map(CODE_SYSTEM_VERSION_TAGS, tag => getTag(tag, version)) }
                  </TableCell>
                }
              </TableRow>
            )
          })
        }
      </TableBody>
    </Table>
  )
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
          map(headFirst(versions), version => (
            <TableRow hover key={version.version || version.uuid || version.id}>
              <TableCell align='center'>
                { version.version || version.uuid || version.id }
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
                      <Tooltip arrow title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
                        <FlagIcon color='secondary' fontSize='small' style={{width: '18px', marginTop: '4px'}}/>
                      </Tooltip>
                    </span>
                  }
                  {
                    locale.external_id &&
                    <span style={{marginRight: '5px'}}>
                      <Tooltip arrow title={`External ID: ${locale.external_id}`} placement='top-start'>
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
  const {
    item, resourceDefinition, resource, isSelected, isSelectable, onPinCreate, onPinDelete, pins,
    showPin, columns, hapi, fhir, history, asReference, lastSelected, refTranslation
  } = props;
  const [isFetchingMappings, setIsFetchingMappings] = React.useState(true);
  const [mappings, setMappings] = React.useState([]);
  const [versions, setVersions] = React.useState([]);
  const [names, setNames] = React.useState([]);
  const [descriptions, setDescriptions] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [pinned, setPin] = React.useState(() => includes(map(pins, 'resource_uri'), item.url));
  const [tab, setTab] = React.useState(0);
  const [selected, setSelected] = React.useState(isSelected);
  const isConceptContainer = includes(['sources', 'collections'], resource);
  const isSourceChild = includes(['concepts', 'mappings'], resource)
  const isValueSet = resource === 'ValueSet';
  const isConceptMap = resource === 'ConceptMap';
  const isPublic = includes(['view', 'edit'], get(item, 'public_access', '').toLowerCase()) && isConceptContainer;
  const pinId = get(find(pins, {resource_uri: item.url}), 'id');
  const tags = resourceDefinition.getTags ? resourceDefinition.getTags(hapi) : resourceDefinition.tags;

  const columnsCount = get(columns, 'length', 1) +
                                               ((isConceptContainer || isValueSet || isConceptMap) ? 1 : 0) + //public column
                                                  (isSelectable ? 1 : 0) + // select column
                                                   ((resourceDefinition.expandible || showPin) ? 1 : 0) + // expand icon column
                                                 (tags ? 1 : 0); //tags column

  React.useEffect(() => setPin(includes(map(pins, 'resource_uri'), item.url)), [pins]);
  React.useEffect(() => setSelected(isSelected), [isSelected]);

  const onClick = event => {
    if(!resourceDefinition.expandible)
      return;

    event.stopPropagation()
    event.preventDefault()

    setOpen(prevOpen => {
      const newOpen = !prevOpen
      if(newOpen) {
        fetchVersions();
        if(resource === 'concepts') {
          fetchNames();
          fetchDescriptions();
          fetchMappings();
        }
      }
      return newOpen
    })
  }

  const getPinService = pinId => {
    const username = get(props, 'match.params.user') || getCurrentUserUsername();
    const orgId = get(props, 'match.params.org');
    let service = null;
    if(orgId && (isCurrentUserMemberOf(orgId) || isAdminUser()))
      service = APIService.orgs(orgId)
    else if(username && isLoggedIn())
      service = APIService.users(username)

    if(service) {
      if(pinId)
        return service.pins(pinId)
      return service.pins()
    }
  }

  const createPin = (resourceType, resourceId) => {
    if(onPinCreate)
      onPinCreate(resourceType, resourceId)
    else
      defaultCreatePin(resourceType, resourceId, getPinService())
  }

  const deletePin = pinId => {
    if(onPinDelete)
      onPinDelete(pinId)
    else
      defaultDeletePin(getPinService(pinId))
  }

  const onPinClick = event => {
    if(!showPin)
      return;

    event.stopPropagation()
    event.preventDefault()

    pinned ? deletePin(pinId) : createPin(item.type, item.uuid);

    return false;
  }

  const onRowClick = event => {
    if(asReference)
      return;
    if(includes(['references'], resource))
      return
    event.stopPropagation();
    event.preventDefault()
    let url;
    if(fhir) {
      if(hapi)
        url = `/fhir/${resource}/${item.resource.id}`;
      else
        url = `/fhir${getOCLFHIRResourceURL(item)}`
    } else {
      if(props.containerOnSelectChange) {
        event.persist()
        onCheckboxClick(event)
      } else {
        if(isSourceChild) {
          event.persist()
          onCheckboxClick(event)
        }
        else
          url = item.url
      }
    };

    if(url)
      history.push(url)
  }

  const handleTabChange = (event, newValue) => setTab(newValue);

  const getOCLFHIRResourceURL = item => {
    const identifiers = flatten([get(item, 'resource.identifier', [])])
    let ident = find(identifiers, ident => get(ident, 'system', '').match('fhir.'))
    if(!ident)
      ident = find(identifiers, ident => get(ident, 'system', '').match('api.'))
    return '/' + compact(get(ident, 'value', '').split('/')).splice(0, 4).join('/')
  };

  const fetchVersions = () => {
    if(fhir) {
      if(hapi) {
        const baseURI = get(getAppliedServerConfig(), 'info.baseURI')
        const resourceType = get(item, 'resource.resourceType')
        const resourceId = get(item, 'resource.id')
        if(resourceType && resourceId)
          APIService.new().overrideURL(`${baseURI}${resourceType}/${resourceId}/_history/?_total=accurate&_sort=-date`).get().then(response => {
            if(response.status === 200)
              setVersions(response.data.entry)
          })

      } else {
        const uri = getOCLFHIRResourceURL(item);
        if(uri)
          APIService.new().overrideURL(uri).appendToUrl('/version/').get().then(response => {
            if(response.status === 200)
              setVersions(response.data.entry)
          })
      }
    } else {
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
                  setIsFetchingMappings(false)
                  if(response.status === 200)
                    setMappings(response.data)
                })
    }
  }

  const onCheckboxClick = event => {
    setSelected(prevSelected => {
      const newValue = !prevSelected;
      props.onSelectChange(item.uuid, newValue)
      return newValue;
    })
    event.stopPropagation();
    event.preventDefault();
  }

  const getTab = label => {
    return (
      <Tab key={label} label={label} style={{fontSize: '12px', fontWeight: 'bold'}} />
    )
  }

  const navigateTo = (event, item, url) => {
    let _url = isFunction(url) ? url(item, hapi) : url;

    if(!isConceptContainer && !fhir)
      _url = url.replace('/versions', '/history')

    event.stopPropagation()
    event.preventDefault()
    window.location.hash = _url
  }

  return (
    <React.Fragment>
      <TableRow
        hover
        style={selected ? {backgroundColor: (item.uuid === lastSelected && isSourceChild) ? 'rgb(190, 209, 226)' : COLOR_ROW_SELECTED, cursor: 'pointer'} : {cursor: 'pointer'}}
        onClick={onRowClick}>
        {
          isConceptContainer &&
          <TableCell align='center'>
            {
              isPublic ?
              <Tooltip arrow title='Public'>
                <span className='flex-vertical-center' style={{marginTop: '5px'}}>
                  <PublicIcon fontSize='small' />
                </span>
              </Tooltip> :
              <Tooltip arrow title='Private'>
                <span className='flex-vertical-center' style={{marginTop: '5px'}}>
                  <PrivateIcon fontSize='small' />
                </span>
              </Tooltip>
            }
          </TableCell>
        }
        {
          (isValueSet || isConceptMap) &&
          <TableCell align='center'>
            <span className='flex-vertical-center'>
              {
                get(item, 'resource.experimental') &&
                <Tooltip arrow title='For testing purposes, not real usage'>
                  <span className='flex-vertical-center'>
                    <WarningIcon fontSize='small' style={{marginTop: '2px'}} />
                  </span>
                </Tooltip>
              }
              {
                get(item, 'resource.immutable') &&
                <Tooltip arrow title='Changes to the content logical definition may occur'>
                  <span className='flex-vertical-center'>
                    <PriorityIcon fontSize='small' style={{marginTop: '2px'}} />
                  </span>
                </Tooltip>
              }
            </span>
          </TableCell>
        }
        {
          isSelectable &&
          <TableCell style={{maxWidth: '30px', padding: '2px'}} align="center">
            <Checkbox size='small' style={{padding: '0px'}} checked={selected} onClick={onCheckboxClick} />
          </TableCell>
        }
        {
          map(columns, column => (
            <TableCell key={column.id} align={column.align || 'left'} className={column.className}>
              { getValue(item, column, refTranslation) }
            </TableCell>
          ))
        }
        {
          !isSelectable &&
          <TableCell align='right' style={{width: '120px', padding: '2px', paddingRight: '10px'}}>
            {
              resourceDefinition.tagWaitAttribute && !has(item, resourceDefinition.tagWaitAttribute) ?
                map(tags, tag => <span key={tag.id} style={{display: 'flex', justifyContent: 'flex-end', margin: '2px 0', marginRight: '10px'}}><Skeleton variant='circular' height={20} width={20} /></span>) :
                map(tags, tag => tag.text ? getTag(tag, item, hapi) : (
                  <Link key={tag.id} to='' onClick={event => navigateTo(event, item, isFunction(tag.hrefAttr) ? tag.hrefAttr : get(item, tag.hrefAttr))}>
                    {getTag(tag, item, hapi)}
                  </Link>
                ))
            }
          </TableCell>
        }
        {
          (resourceDefinition.expandible || showPin) &&
          <TableCell align='right' style={{width: '50px'}}>
            {
              resourceDefinition.expandible &&
              (
                resource === 'mappings' ?
                <MappingOptions mapping={item} /> :
                <IconButton aria-label="expand row" size="small" onClick={onClick}>
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              )
            }
            {
              showPin &&
              <IconButton aria-label="expand row" size="small" onClick={onPinClick}>
                {<PinIcon fontSize="small" pinned={pinned ? pinned.toString() : undefined} />}
              </IconButton>
            }
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
                      <AllMappingsTables mappings={mappings} concept_url={item.url} isLoading={isFetchingMappings} />
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
                      <LocalesTable locales={descriptions} isDescription />
                    </div>
                  }
                  {
                    fhir && tab === resourceDefinition.tabs.indexOf('Copyright') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <div className="col-md-12" style={{padding: '20px'}} dangerouslySetInnerHTML={{__html: item.resource.copyright}} />
                    </div>
                  }
                  {
                    fhir && tab === resourceDefinition.tabs.indexOf('Details') &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      <FhirContainerResource {...item} style={{padding: '20px'}} />
                    </div>
                  }
                  {
                    (
                      tab === resourceDefinition.tabs.indexOf('History') ||
                      tab === resourceDefinition.tabs.indexOf('Versions')
                    ) &&
                    <div style={{borderTop: '1px solid lightgray', maxHeight: '175px', overflow: 'auto'}}>
                      {
                        fhir ?
                        <FHIRHistoryTable versions={versions} resource={resource} /> :
                        <HistoryTable versions={versions} />
                      }
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

const ResultsTable = (
  {
    resource, results, onPageChange, onSortChange, sortParams,
    onPinCreate, onPinDelete, pins, nested, showPin, essentialColumns, onReferencesDelete,
    isVersionedObject, onCreateSimilarClick, onCreateMappingClick, viewFields, hapi, fhir, history,
    onSelect, asReference, onSelectChange, onIndependentDetailsToggle, onWidthChange, onLimitChange,
    isInsideConfiguredOrg, isLoading, limit
  }
) => {
  const [details, setDetails] = React.useState(null);
  const [refTranslation, setRefTranslation] = React.useState(true)
  const resourceDefinition = RESOURCE_DEFINITIONS[resource];
  const theadBgColor = get(resourceDefinition, 'headBgColor', BLUE);
  const theadTextColor = get(resourceDefinition, 'headTextColor', WHITE);
  const theadStyles = {
    backgroundColor: theadBgColor,
  }
  const isConceptContainer = includes(['sources', 'collections'], resource);
  const isValueSet = resource === 'ValueSet'
  const isConceptMap = resource === 'ConceptMap'
  const shouldShowPin = showPin && resourceDefinition.pinnable;
  const canRender = (results.total && resourceDefinition) || isLoading;
  const defaultOrderBy = get(find(resourceDefinition.columns, {sortOn: get(values(sortParams), '0', 'last_update')}), 'id', 'UpdateOn');
  const defaultOrder = get(keys(sortParams), '0') === 'sortAsc' ? 'asc' : 'desc';
  const [selectedList, setSelectedList] = React.useState([]);
  const [orderBy, setOrderBy] = React.useState(defaultOrderBy)
  const [order, setOrder] = React.useState(defaultOrder)
  const hasAccess = currentUserHasAccess()
  const isSourceChild = includes(['concepts', 'mappings'], resource);
  const isReferenceResource = resource === 'references';
  const isSelectable = (isReferenceResource && hasAccess && isVersionedObject) ||
                       isSourceChild;

  const hasZeroActiveButSomeRetiredResults = () => isSourceChild && results?.total === 0 && Boolean(retiredResults())

  const retiredResults = () => {
    const retired = results.facets?.fields?.retired
    return get(find(retired, info => info[0] === 'true' && info[1] > 0 && info[2] === false), '1')
  }

  const onAllSelect = event => {
    const newList = event.target.checked ? map(results.items, 'uuid') : [];
    setSelectedList(newList)

    if(onSelectChange)
      onSelectChange(isEmpty(newList) ? [] : map(filter(results.items, item => includes(newList, item.uuid)), 'version_url'))
  };
  const updateSelected = (id, selected) => {
    const newList = selected ? uniq([...selectedList, id]) : without(selectedList, id)
    setSelectedList(newList)
    if(includes(['concepts', 'mappings'], resource)) {
      const lastSelected = find(results.items, {uuid: last(newList)})
      if(onSelectChange)
        onSelectChange(map(filter(results.items, item => includes(newList, item.uuid)), 'version_url'))
      if(onSelect)
        onSelect(lastSelected)
      if(!onSelect && !onSelectChange)
        onDetailsToggle(lastSelected)
    }
  };
  const getOppositeOrder = order => order === 'asc' ? 'desc' : 'asc';
  const onSort = (event, columnId) => {
    const column = find(resourceDefinition.columns, {id: columnId})
    let newOrder = get(column, 'sortBy') || 'desc';
    if(orderBy === columnId)
      newOrder = getOppositeOrder(order)

    const sortOn = get(column, 'sortOn', 'last_update')
    let sortQuery = {sortDesc: sortOn}
    if(newOrder === 'asc')
      sortQuery = {sortAsc: sortOn}

    setOrder(newOrder)
    setOrderBy(columnId)
    onSortChange(sortQuery)
  }

  const filterColumnsFromViewFields = () => {
    const result = map(viewFields, fieldConfig => {
      const attr = keys(fieldConfig)[0]
      const label = fieldConfig[attr];
      const column = find(ALL_COLUMNS[resource], {value: attr})
      return column ? {...column, label: label} : {label: label, id: attr, value: attr, sortable: false}
    })
    return result
  }

  const getSelectedItems = () => filter(results.items, item => includes(selectedList, item.uuid))
  let columns = essentialColumns ?
                reject(resourceDefinition.columns, c => c.essential === false) :
                resourceDefinition.columns;

  columns = isEmpty(viewFields) ? columns : filterColumnsFromViewFields()
  const columnsCount = get(columns, 'length', 1) + ((resourceDefinition.expandible || shouldShowPin) ? 2 : 1) + ((isConceptContainer || isValueSet || isConceptMap) ? 1 : 0);
  const selectionRowColumnsCount = get(selectedList, 'length', 0) > 0 ? columnsCount - 2 : columnsCount;

  const onDetailsToggle = item => {
    setDetails(item)
    if(onIndependentDetailsToggle)
      onIndependentDetailsToggle(item)
  }

  const onCloseSideDrawer = () => {
    onWidthChange(false)
    onDetailsToggle(null)
  }

  React.useEffect(() => !details && onCloseSideDrawer(), [details])
  React.useEffect(() => setSelectedList(map(getSelectedItems(), 'uuid')) , [results])

  const selectedItems = getSelectedItems()
  const selectedCount = get(selectedItems, 'length', 0)
  const hasItems = Boolean(selectedCount)
  const isAllSelected = hasItems && selectedCount === get(results, 'items.length', 0)
  const isSomeSelected = hasItems && selectedCount > 0 && !isAllSelected
  return (
    <React.Fragment>
      <div className='col-sm-12 no-side-padding'>
        {
          canRender ?
          <div className='col-sm-12 no-side-padding search-results'>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer style={{borderRadius: '4px'}} sx={{maxHeight: nested && !isInsideConfiguredOrg ? '65vh': '75vh'}}>
                <Table stickyHeader size='small'>
                  <TableHead>
                    {
                      selectedCount > 0 &&
                      <TableRow colSpan={selectionRowColumnsCount} style={{backgroundColor: 'rgba(0, 0, 0, 0.09)'}}>
                        <TableCell colSpan={columnsCount} align='left' style={{backgroundColor: 'rgba(224, 224, 224, 1)'}}>
                          <span className='flex-vertical-center'>
                            <span style={{margin: '0px 10px', whiteSpace: 'pre'}}>{selectedCount} Selected</span>
                            {
                              !asReference &&
                              <SelectedResourceControls
                                selectedItems={selectedItems}
                                resource={resource}
                                onCreateSimilarClick={onCreateSimilarClick}
                                onCreateMappingClick={onCreateMappingClick}
                                onReferencesDelete={onReferencesDelete}
                              />
                            }
                          </span>
                        </TableCell>
                      </TableRow>
                    }
                    <TableRow style={theadStyles}>
                      {
                        (isConceptContainer || isValueSet || isConceptMap) &&
                          <TableCell style={{...theadStyles, top: selectedCount > 0 ? 40 : 0}} />
                      }
                      {
                        isSelectable &&
                          <TableCell style={{maxWidth: '30px', padding: '2px', ...theadStyles, top: selectedCount > 0 ? 40 : 0}} align="center">
                          <Checkbox checked={isAllSelected} indeterminate={isSomeSelected} size='small' style={{color: theadTextColor, padding: '0px'}} onChange={onAllSelect} />
                        </TableCell>
                      }
                      {
                        map(columns, column => {
                          const isSortable = column.sortable !== false;
                          return isSortable ? (
                            <TableCell
                              key={column.id}
                              sortDirection={orderBy === column.id ? order : false}
                              align={column.align || 'left'}
                              style={{color: theadTextColor, ...theadStyles, top: selectedCount > 0 ? 40 : 0}}>
                              {
                                column.tooltip ?
                                <Tooltip arrow placement='top' title={column.tooltip}>
                                  <TableSortLabel
                                    className='table-sort-label-white'
                                    active={orderBy === column.id}
                                    direction={orderBy === column.id ? order : (column.sortBy || 'desc')}
                                    onClick={(event) => onSort(event, column.id)}
                                    style={{color: theadTextColor}}
                                  >
                                    { column.label }
                                  </TableSortLabel>
                                </Tooltip> :
                                <TableSortLabel
                                  className='table-sort-label-white'
                                  active={orderBy === column.id}
                                  direction={orderBy === column.id ? order : (column.sortBy || 'desc')}
                                  onClick={(event) => onSort(event, column.id)}
                                  style={{color: theadTextColor}}
                                  >
                                  { column.label }
                                </TableSortLabel>
                              }
                            </TableCell>
                          ) : (
                            <TableCell key={column.id} align={column.align || 'left'} style={{color: theadTextColor, ...theadStyles, top: selectedCount > 0 ? 40 : 0}}>
                              {
                                column.translation ?
                                  <span>
                                    <span>{column.label}</span>
                                    <span style={{marginLeft: '20px'}}>
                                      <FormControlLabel
                                        size='small'
                                        control={
                                          <Switch
                                            color="default"
                                            size='small'
                                            checked={refTranslation}
                                            onChange={event => setRefTranslation(event.target.checked)} />
                                        }
                                        label={
                                          <span style={{fontSize: '12px', marginLeft: '5px'}}>
                                            {refTranslation ? 'Show Expression' : 'Show Translation'}
                                          </span>
                                        }
                                      />
                                    </span>
                                  </span> :
                                column.label
                              }
                            </TableCell>
                          )
                        })
                      }
                      {
                        !isSelectable &&
                          <TableCell style={{...theadStyles, top: selectedCount > 0 ? 40 : 0}} />
                      }
                      {
                        (resourceDefinition.expandible || shouldShowPin) &&
                          <TableCell style={{...theadStyles, top: selectedCount > 0 ? 40 : 0}} />
                      }
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      isLoading ? (
                        times(10, rowIndex => (
                          <TableRow key={rowIndex}>
                            {
                              times(selectionRowColumnsCount, columnIndex => (
                                <TableCell key={columnIndex} align='center' style={{paddingTop: '10px', paddingBottom: '10px'}}>
                                    <Skeleton height={35} />
                                </TableCell>
                              ))
                            }
                          </TableRow>
                        ))
                      ) : (
                      map(results.items, (item, index) => (
                      <ExpandibleRow
                        key={item.uuid || item.id || index}
                        item={item}
                        resource={resource}
                        resourceDefinition={resourceDefinition}
                        isSelected={includes(selectedList, item.uuid)}
                        onSelectChange={updateSelected}
                        containerOnSelectChange={onSelectChange}
                        isSelectable={isSelectable}
                        onPinCreate={onPinCreate}
                        onPinDelete={onPinDelete}
                        pins={pins}
                        nested={nested}
                        showPin={shouldShowPin}
                        columns={columns}
                        hapi={hapi}
                        fhir={fhir}
                        history={history}
                        asReference={asReference}
                        lastSelected={last(selectedList)}
                        refTranslation={refTranslation}
                      />
                      )))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                className='dense-table-pagination'
                component="div"
                rowsPerPageOptions={fhir && !hapi ? [] : [10, 25, 50, 100]}
                rowsPerPage={limit}
                page={results.pageNumber - 1}
                count={results.total}
                onPageChange={(event, page) => onPageChange(page + 1)}
                onRowsPerPageChange={event => onLimitChange(event.target.value)}
                variant="outlined"
                shape="rounded"
                color="primary"
                labelRowsPerPage="Results per page:"
                showFirstButton
                showLastButton
                sx={{backgroundColor: 'rgba(0, 0, 0, 0.09)'}}
                labelDisplayedRows={({from, to, count}) => {
                    const total = count === -1 ? `more than ${to}` : count
                    return `${from}–${to} of ${(total || 0).toLocaleString()}`
                }}
              />
            </Paper>
          </div> :
          <div style={{padding: '2px'}}>
            {
              hasZeroActiveButSomeRetiredResults() ?
                <span>
                  We found 0 {startCase(resource)}. Would you like to view
                  <Link to={window.location.hash.replace('#/', '/') + '&facets={"retired":{"true":true}}'} style={{marginLeft: '3px'}}>
                    {`${retiredResults()} Retired ${startCase(resource)}?`}
                  </Link>
                  </span> :
              `We found 0 ${startCase(resource)}.`
            }
          </div>
        }
      </div>
    </React.Fragment>
  )
}

export default ResultsTable
