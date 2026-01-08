import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  map,
  isEmpty,
  startCase,
  get,
  includes,
  merge,
  orderBy,
  last,
  find,
  reject,
  forEach,
  uniqBy,
  isFunction,
  keys,
  pick
} from 'lodash';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as RetireIcon,
  AccountTreeRounded as VersionIcon,
  AspectRatio as ExpansionIcon,
  NewReleases as ReleaseIcon,
  FileCopy as CopyIcon,
  CheckCircle as DefaultIcon,
  BrightnessAuto as AutoIcon,
  Info as InfoIcon,
  Functions as SummaryIcon,
  WarningAmber as WarningIcon,
  NoteAdd as AddSimilarIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import ProcessingIcon from '@mui/icons-material/HourglassTop';
import EvaluateIcon from '@mui/icons-material/Functions';

import APIService from '../../services/APIService';
import { copyURL, toFullAPIURL } from '../../common/utils';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ConceptContainerVersionForm from '../common/ConceptContainerVersionForm';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptContainerExport from '../common/ConceptContainerExport';
import { GREEN } from '../../common/constants';
import SourceChildVersionAssociationWithContainer from '../common/SourceChildVersionAssociationWithContainer';
import { StateChip } from '../common/ConceptContainerVersionList';
import { TAGS } from '../search/ResultConstants'

const onCopyClick = url => copyURL(toFullAPIURL(url));

const handleResponse = (response, resource, action, successCallback) => {
  if (includes([200, 204], get(response, 'status')))
    alertifyjs.success(`${resource} Version ${action}`, 1, () => {
      if (successCallback) successCallback(response.data);
      else window.location.reload();
    });
  else alertifyjs.error('Something bad happened!');
};

const handleExpansionResponse = (response, action, successCallback) => {
  if (includes([200, 204], get(response, 'status')))
    alertifyjs.success(`Collection Expansion ${action}`, 1, () => {
      if (successCallback) successCallback(response.data);
      else window.location.reload();
    });
  else alertifyjs.error('Something bad happened!');
};

const getService = version => APIService.new().overrideURL(version.version_url);
const deleteVersion = version =>
  getService(version).delete().then(response => handleResponse(response, version.type, 'Deleted'));
const updateVersion = (version, data, verb, successCallback) =>
  getService(version)
    .put(data)
    .then(response => handleResponse(response, version.type, verb, updatedVersion => successCallback(merge(version, updatedVersion))));
const deleteExpansion = expansion =>
  APIService.new().overrideURL(expansion.url).delete().then(response => handleExpansionResponse(response, 'Deleted'));

const PAGE_SIZE = 5;

// Keep widths aligned between parent + nested for Resources / Actions
const COL_WIDTHS = {
  expand: 52,
  id: '10%',
  resources: '20%',
  actions: 80,
};

const RowActionMenu = ({ items, disabled }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const onOpen = e => setAnchorEl(e.currentTarget);
  const onClose = () => setAnchorEl(null);

  // items: [{key, label, icon, onClick, disabled, component, href}]
  const safeItems = (items || []).filter(Boolean);

  return (
    <>
      <IconButton size="small" onClick={onOpen} disabled={disabled}>
        <MoreVertIcon fontSize="inherit" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {
          map(safeItems, (item, index) => {
          if (item.component)
            return <span key={index}>{item.component}</span>

          const content = (
            <MenuItem
              key={index}
              disabled={Boolean(item.disabled)}
              onClick={() => {
                onClose();
                if (item.onClick) item.onClick();
              }}
              component={item.href ? 'a' : 'li'}
              href={item.href || undefined}
            >
              {item.icon ? <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{item.icon}</Box> : null}
              {item.label}
            </MenuItem>
          );

          return item.tooltip ? (
            <Tooltip key={item.key} title={item.tooltip} placement="left" arrow>
              <span>{content}</span>
            </Tooltip>
          ) : (
            content
          );
        })}
      </Menu>
    </>
  );
};

const VersionList = ({
  canEdit,
  onUpdate,
  onCreateExpansionClick,
  onCreateSimilarExpansionClick,
  onEvaluateExpansionClick,
  collection,
}) => {
  const resource = 'collection';
  const [pagination, setPagination] = React.useState({});
  const [pageSize, setPageSize] = React.useState(PAGE_SIZE);
  const [versions, setVersions] = React.useState([]);
  const [versionForm, setVersionForm] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
  const [expansions, setExpansions] = React.useState({});
  const [loadingExpansions, setLoadingExpansions] = React.useState({});
  const [openExpansionDialog, setOpenExpansionDialog] = React.useState(false);
  const [closedRows, setClosedRows] = React.useState({}); // { [version.uuid]: boolean }

  const onEditClick = version => {
    setSelectedVersion(version);
    setVersionForm(true);
  };
  const onEditCancel = () => setVersionForm(false);

  const handleOnClick = (title, message, onOk) => {
    const confirm = alertifyjs.confirm();
    confirm.setHeader(title);
    confirm.setMessage(message);
    confirm.set('onok', onOk);
    confirm.show();
  };

  const onVersionUpdate = (version, attr, label, successLabel) => {
    const newValue = !get(version, attr);
    label = newValue ? label : `un-${label}`;
    const resLabel = newValue ? successLabel : `Un${successLabel}`;
    const title = `Update ${startCase(resource)} Version : ${version.short_code} [${version.id}]`;
    const message = `Are you sure you want to ${label} this ${resource} version ${version.id}?`;

    handleOnClick(title, message, () => updateVersion(version, { [attr]: newValue }, resLabel, onUpdate));
  };

  const onReleaseClick = version => onVersionUpdate(version, 'released', 'release', 'Released');
  const onRetireClick = version => onVersionUpdate(version, 'retired', 'retire', 'Retired');

  const onDeleteClick = version => {
    const title = `Delete ${startCase(resource)} Version : ${version.short_code} [${version.id}]`;
    const message = `Are you sure you want to permanently delete this ${resource} version ${version.id}? This action cannot be undone! This will delete the version and all of its details. Concepts and mappings in this ${resource} version will not be affected.`;

    handleOnClick(title, message, () => deleteVersion(version));
  };

  const onDeleteExpansionClick = expansion => {
    const title = `Delete Collection Expansion : ${expansion.mnemonic}`;
    const message =
      'Are you sure you want to permanently delete this collection expansion? This action cannot be undone! This will delete the expansion and all of its details. Concepts and mappings in this collection expansion will not be affected.';

    handleOnClick(title, message, () => deleteExpansion(expansion));
  };

  const onMarkExpansionDefault = (version, expansion) => {
    const service = getService(version);
    if (version.version === 'HEAD') service.appendToUrl('HEAD/');
    service.put({ expansion_url: expansion.url }).then(response => {
      if (response.status === 200) {
        alertifyjs.success('Successfully marked expansion as version default');
        onUpdate({ ...version, expansion_url: expansion.url });
        const newExpansions = getFormattedExpansions({ ...version, expansion_url: expansion.url }, expansions[version.uuid]);
        setExpansions({ ...expansions, [version.uuid]: newExpansions });
      }
    });
  };

  const getFormattedExpansions = (version, versionExpansions) => {
    if (isEmpty(versionExpansions)) return [];
    let _expansions = map(orderBy(versionExpansions, 'id', 'desc'), expansion => ({ ...expansion, default: false }));
    if (version.autoexpand) {
      _expansions = [{ ...last(_expansions), auto: true }, ..._expansions.slice(0, -1)];
    }
    if (version.expansion_url) {
      const defaultExpansion = find(_expansions, { url: version.expansion_url });
      const otherExpansions = reject(_expansions, { url: version.expansion_url });
      if (defaultExpansion) _expansions = [{ ...defaultExpansion, default: true }, ...otherExpansions];
    }
    return _expansions;
  };

  const isExpansionsLoaded = version => Boolean(!isEmpty(get(expansions, version.uuid)));
  const isExpansionsLoading = version => Boolean(get(loadingExpansions, version.uuid));

  const fetchExpansions = version => {
    if (isExpansionsLoading(version)) return;
    setLoadingExpansions({ ...loadingExpansions, [version.uuid]: true });

    const isHEAD = version.id.toLowerCase() === 'head';
    const service = getService(version);
    if (isHEAD) service.appendToUrl('HEAD/');

    service
      .appendToUrl('expansions/?includeSummary=true&verbose=true')
      .get()
      .then(response => {
        setExpansions(prevExpansions => ({ ...prevExpansions, [version.uuid]: getFormattedExpansions(version, response.data) }));
        setLoadingExpansions(prevLoading => ({ ...prevLoading, [version.uuid]: false }));
      });
  };

  const fetchExpansionsForAllVersions = _versions => {
    forEach(_versions, version => {
      if (version && !isExpansionsLoaded(version) && !isExpansionsLoading(version)) {
        fetchExpansions(version);
      }
    });
  };

  const onComputeSummaryClick = version => {
    APIService.new()
      .overrideURL(version.version_url)
      .appendToUrl('summary/')
      .put()
      .then(response => {
        if (response.detail || response.error) alertifyjs.error(response.detail || response.error, 5);
        else if (response.status === 202)
          alertifyjs.success(
            'The request is in queue. It may take few minutes to update the summary depending on the size of repository. Please revisit in few minutes.',
            10
          );
        else alertifyjs.error('Something went wrong.', 5);
      });
  };

  const fetchVersions = (page, _pageSize) => {
    APIService.new()
      .overrideURL(collection.url)
      .appendToUrl('versions/')
      .get(null, null, { limit: _pageSize || pageSize, includeSummary: true, verbose: true, page: page, includeStates: true })
      .then(response => {
        const _versions = uniqBy([{ ...collection, id: 'HEAD', version_url: collection.url, version: 'HEAD', uuid: 'HEAD' }, ...response.data], 'id');
        setPagination({
          page: parseInt(response.headers.page_number),
          pages: parseInt(response.headers.pages),
          count: parseInt(response.headers.num_found),
        });
        setVersions(_versions);
        fetchExpansionsForAllVersions(_versions);
      });
  };

  const loadMore = (event, newPage) => fetchVersions(newPage + 1);

  const onRowsPerPageChange = event => {
    const _pageSize = parseInt(event.target.value, 10);
    setPageSize(_pageSize);
    fetchVersions(0, _pageSize);
  };

  React.useEffect(fetchVersions, [collection]);

  const toggleRow = version => {
    const next = !closedRows[version.uuid];
    setClosedRows(prev => ({ ...prev, [version.uuid]: next }));
    if (next && !isExpansionsLoaded(version) && !isExpansionsLoading(version)) fetchExpansions(version);
  };

  const renderVersionIdCell = version => {
    const isHEAD = version.id.toLowerCase() === 'head';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <VersionIcon sx={{ mr: 1, width: 16 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <a href={'#' + (version.version_url || version.url)}><b>{version.version}</b></a>
            {version.autoexpand ? (
              <Tooltip arrow title="Auto-Expand" placement="right">
                <ExpansionIcon sx={{ color: GREEN, ml: 2, width: 16 }} />
              </Tooltip>
            ) : null}
          </Box>

          <Box sx={{ mt: 0.5 }}>
            <LastUpdatedOnLabel
              by={version.created_by}
              date={version.created_on}
              label="Created"
              timeTakenLabel="Export Time"
              timeTaken={version?.extras?.__export_time || false}
            />
          </Box>

          {!isHEAD && version?.short_code ? (
            <Box sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary' }}>{`${version.short_code} [${version.id}]`}</Box>
          ) : null}
        </Box>
      </Box>
    );
  };

  const renderVersionResourcesCell = version => {
    const tags = TAGS.collections
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {
            tags.map(tag => {
              return (
                <span key={tag.id} style={{...tag.style}}>
                  <a href={isFunction(tag.hrefAttr) ? tag.hrefAttr(version) : get(version, tag.hrefAttr)} style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
                    {tag.icon}
                    <span style={{marginLeft: '4px', marginTop: '2px'}}>
                      {get(version, tag.value)?.toLocaleString() || '-'}
                    </span>
                  </a>
                </span>
              )
            })
          }
        </Box>
      </Box>
    );
  };

  const getVersionActionItems = version => {
    const isHEAD = version.id.toLowerCase() === 'head';
    const items = [];

    if (canEdit && !isHEAD) {
      items.push({
        key: 'edit',
        label: 'Edit Version',
        icon: <EditIcon fontSize="small" />,
        onClick: () => onEditClick(version),
      });
      items.push({
        key: 'release',
        label: version.released ? 'UnRelease Version' : 'Release Version',
        icon: <ReleaseIcon fontSize="small" />,
        onClick: () => onReleaseClick(version),
      });
      items.push({
        key: 'retire',
        label: version.retired ? 'UnRetire Version' : 'Retire Version',
        icon: <RetireIcon color='error' fontSize="small" />,
        onClick: () => onRetireClick(version),
      });
      items.push({
        key: 'delete',
        label: 'Delete Version',
        icon: <DeleteIcon color='error' fontSize="small" />,
        disabled: Boolean(version.retired),
        onClick: () => onDeleteClick(version),
      });
    }

    if (canEdit && version) {
      items.push({
        key: 'summary',
        label: 'Re-compute Summary',
        icon: <SummaryIcon fontSize="small" />,
        onClick: () => onComputeSummaryClick(version),
      });
    }

    items.push({
      key: 'copy',
      label: 'Copy API URL',
      icon: <CopyIcon fontSize="small" />,
      onClick: () => onCopyClick(version.version_url),
    });

    items.push({
      key: 'export',
      label: 'Export Version/Resources',
      component: <ConceptContainerExport
                   isHEAD={version.id.toLowerCase() === 'head'}
                   title={`Export Version ${version.id}`}
                   version={version}
                   resource="collection"
                   variant='menuItem'
                 />
    });

    return items;
  };

  const renderExpansionIdCell = expansion => {
    const isDefault = expansion.default;
    const isAuto = expansion.auto;

    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <ExpansionIcon sx={{ mr: 1, width: 16, mt: '2px' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={'#' + expansion.url}><b>{expansion.mnemonic}</b></a>

            {isDefault ? (
              <Tooltip arrow title="Default Expansion" placement="right">
                <DefaultIcon sx={{ color: GREEN, ml: 1, width: 16 }} />
              </Tooltip>
            ) : null}

            {isAuto ? (
              <Tooltip arrow title="Auto-Expand" placement="right">
                <AutoIcon sx={{ ml: 1, width: 16 }} />
              </Tooltip>
            ) : null}

            {expansion?.extras?.__legacy_expansion ? (
              <Tooltip
                arrow
                title="Legacy Expansion: This expansion was created using OCL's legacy expansion logic. While you may still use this expansion, it is recommended that you recreate it using OCL's new expansion logic, which has better version handling and improves consistency and reproducibility across implementations."
                placement="right"
              >
                <WarningIcon color="warning" sx={{ ml: 1, width: 16 }} />
              </Tooltip>
            ) : null}

            {expansion?.is_processing ? (
              <Tooltip arrow title="Processing" placement="right">
                <ProcessingIcon color="warning" sx={{ ml: 1, width: 16 }} />
              </Tooltip>
            ) : null}
          </Box>

          <Box sx={{ mt: 0.5 }}>
            <LastUpdatedOnLabel by={expansion.created_by} date={expansion.created_on} label="Created" />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderExpansionParametersCell = expansion => {
    let params = expansion?.parameters || {};
    let _keys = keys(params)
    let viewMore = _keys.length > 3
    if(viewMore)
      params = pick(params, ['system-version', 'exclude-system', 'check-system-version'])
    return (
      <>
        <ul style={{margin: 0, padding: 0}}>
          {map(params, (value, key) => {
            return (<li key={key}>{key}: {value}</li>)
          })}
        </ul>
        {viewMore ? <a style={{fontSize: '12px', cursor: 'pointer'}} onClick={() => setOpenExpansionDialog(expansion)}>view more</a> : null}
        </>
    );
  };

  const renderResolvedRepoVersionsCell = expansion => {
    const explicitRepoVersions = [...(expansion?.explicit_source_versions || []), ...(expansion?.explicit_collection_versions || [])];
    const evaluatedRepoVersions = [...(expansion?.evaluated_source_versions || []), ...(expansion?.evaluated_collection_versions || [])];

    if (!(explicitRepoVersions?.length > 0 || evaluatedRepoVersions?.length > 0)) return <span style={{ color: 'rgba(0,0,0,0.5)' }}>—</span>;

    return (
      <Box sx={{ fontSize: 12 }}>
        {explicitRepoVersions?.length > 0 ? (
          <>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>Explicit:</Box>
            {map(explicitRepoVersions, (repoVersion, index) => (
              <>
              <a
                key={repoVersion.version_url}
                style={{ margin: '0 2px' }}
                rel="noopener noreferrer"
                target="_blank"
                href={`#${repoVersion.version_url}`}
              >
                {`${repoVersion.owner} / ${repoVersion.short_code}:${repoVersion.version}`}
              </a>
                {explicitRepoVersions.length > (index + 1) ? ', ' : ''}
              </>
            ))}
          </>
        ) : null}

        {evaluatedRepoVersions?.length > 0 ? (
          <>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>Auto-resolved:</Box>
            {map(evaluatedRepoVersions, (repoVersion, index) => (
              <>
              <a
                key={repoVersion.version_url}
                style={{ margin: '0 2px' }}
                rel="noopener noreferrer"
                target="_blank"
                href={`#${repoVersion.version_url}`}
              >
                {`${repoVersion.owner} / ${repoVersion.short_code}:${repoVersion.version}`}
              </a>
                {evaluatedRepoVersions.length > (index + 1) ? ', ' : ''}
                </>
            ))}
          </>
        ) : null}
      </Box>
    );
  };

  const renderExpansionResourcesCell = expansion => {
    const conceptTag = TAGS.collections.find(tag => tag.id === 'activeConcepts')
    const mappingTag = TAGS.collections.find(tag => tag.id === 'activeMappings')
    const tags = [conceptTag, mappingTag]
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: 12 }}>
        {tags.map(tag => {
          return (
            <span key={tag.id} style={{display: 'flex', alignItems: 'center', fontSize: '12px', ...tag.style}}>
              {tag.icon}
              <span style={{marginLeft: '4px', marginTop: '2px'}}>
                {get(expansion, tag.value)?.toLocaleString() || '-'}
              </span>
            </span>
          )
        })}
      </Box>
    );
  };

  const getExpansionActionItems = (version, expansion) => {
    const isDefault = expansion.default;
    const items = [];

    items.push({
      key: 'default',
      label: isDefault ? 'Default Expansion' : 'Mark as Default',
      icon: <DefaultIcon fontSize="small" />,
      disabled: Boolean(isDefault),
      onClick: () => onMarkExpansionDefault(version, expansion),
    });

    items.push({
      key: 'copy',
      label: 'Copy API URL',
      icon: <CopyIcon fontSize="small" />,
      onClick: () => onCopyClick(expansion.url),
    });

    if (canEdit) {
      items.push({
        key: 'similar',
        label: 'Create Similar Expansion',
        icon: <AddSimilarIcon fontSize="small" />,
        tooltip:
          "Create Similar Expansion: The new expansion will be created with OCL's new expansion logic, which has better version handling and improved consistency and reproducibility across servers.",
        onClick: () => onCreateSimilarExpansionClick(version, expansion),
      });

      items.push({
        key: 'rebuild',
        label: 'Rebuild Expansion',
        icon: <EvaluateIcon fontSize="small" />,
        tooltip: 'Rebuild Expansion: Re-evaluates all references for this expansion using the same parameters',
        disabled: Boolean(expansion?.is_processing),
        onClick: () => onEvaluateExpansionClick(version, expansion),
      });

      items.push({
        key: 'delete',
        label: 'Delete Expansion',
        icon: <DeleteIcon color='error' fontSize="small" />,
        disabled: Boolean(expansion.retired || isDefault),
        onClick: () => onDeleteExpansionClick(expansion),
      });
    }

    return items;
  };

  return (
    <div className="col-md-12 no-side-padding">
      <Card variant="outlined" sx={{ mb: 1 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small" aria-label="versions table">
              <colgroup>
                <col style={{ width: COL_WIDTHS.expand }} />
                <col />
                <col />
                <col style={{ width: COL_WIDTHS.resources }} />
                <col style={{ width: COL_WIDTHS.actions }} />
              </colgroup>

              <TableBody>
                {map(versions, version => {
                  const isLoading = isExpansionsLoading(version);
                  const versionExpansions = get(expansions, version.uuid, []);
                  const isClosed = Boolean(closedRows[version.uuid]);

                  return (
                    <React.Fragment key={version.uuid}>
                      <TableRow hover sx={{'.MuiTableCell-root': {padding: '3px 8px'}}}>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleRow(version)}>
                            {!isClosed ? <KeyboardArrowUpIcon fontSize="inherit" /> : <KeyboardArrowDownIcon fontSize="inherit" />}
                          </IconButton>
                        </TableCell>

                        <TableCell>{renderVersionIdCell(version)}</TableCell>

                        <TableCell>
                          {!isEmpty(version.states) ? (
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <StateChip label="Seeded Concepts" state={version.states.seeded_concepts} />
                              <StateChip label="Seeded Mappings" state={version.states.seeded_mappings} />
                              <StateChip label="Indexed Concepts" state={version.states.indexed_concepts} />
                              <StateChip label="Indexed Mappings" state={version.states.indexed_mappings} />
                              <StateChip label="Export" state={version.states.exported} />
                            </Box>
                          ) : null}
                        </TableCell>
                        <TableCell>{renderVersionResourcesCell(version)}</TableCell>

                        <TableCell align="right">
                          <RowActionMenu items={getVersionActionItems(version)} />
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: '55px' }} colSpan={5}>
                          <Collapse in={!isClosed} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 1 }}>
                              {isLoading ? (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                  <CircularProgress />
                                </Box>
                              ) : isEmpty(versionExpansions) && loadingExpansions[version.uuid] === false ? (
                                <Box className="flex-column-center" sx={{ py: 3 }}>
                                  {canEdit ? (
                                    <Button onClick={() => onCreateExpansionClick(version)} variant="text" size="small" style={{ textTransform: 'inherit' }}>
                                      Create First Expansion for this version
                                    </Button>
                                  ) : (
                                    <p style={{ margin: 0 }}>No expansions yet</p>
                                  )}
                                </Box>
                              ) : (
                                <Table size="small" aria-label="expansions table">
                                  <colgroup>
                                    <col style={{ width: '24%' }} />
                                    <col style={{ width: '18%' }} />
                                    <col />
                                    <col style={{ width: COL_WIDTHS.resources }} />
                                    <col style={{ width: COL_WIDTHS.actions }} />
                                  </colgroup>

                                  <TableHead>
                                    <TableRow sx={{'.MuiTableCell-root': {padding: '3px 8px', fontSize: '12px'}}}>
                                      <TableCell>
                                       Expansion ID
                                      </TableCell>
                                      <TableCell>
                                        Parameters
                                      </TableCell>
                                      <TableCell>
                                        Resolved Repo Versions
                                      </TableCell>
                                      <TableCell>
                                        Resources
                                      </TableCell>
                                      <TableCell align="right" />
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {map(versionExpansions, expansion => (
                                      <TableRow key={expansion.id} hover sx={{'.MuiTableCell-root': {padding: '3px 8px'}}}>
                                        <TableCell sx={{ verticalAlign: 'top' }}>{renderExpansionIdCell(expansion)}</TableCell>

                                        <TableCell sx={{ verticalAlign: 'top' }}>{renderExpansionParametersCell(expansion)}</TableCell>

                                        <TableCell sx={{ verticalAlign: 'top' }}>{renderResolvedRepoVersionsCell(expansion)}</TableCell>

                                        <TableCell sx={{ verticalAlign: 'top' }}>{renderExpansionResourcesCell(expansion)}</TableCell>

                                        <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                                          <RowActionMenu items={getExpansionActionItems(version, expansion)} />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {selectedVersion ? (
        <CommonFormDrawer
          style={{ zIndex: 1202 }}
          isOpen={versionForm}
          onClose={onEditCancel}
          formComponent={
            <ConceptContainerVersionForm
              onCancel={onEditCancel}
              edit
              parentURL={get(selectedVersion, 'version_url')}
              version={selectedVersion}
              resource={resource}
              expansions={get(expansions, selectedVersion.uuid, [])}
              reloadOnSuccess
            />
          }
        />
      ) : null}

      {openExpansionDialog ? (
        <Dialog open onClose={() => setOpenExpansionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{`Expansion: ${openExpansionDialog.mnemonic}`}</DialogTitle>
          <DialogContent>
            <div>
              <h3 className="flex-vertical-center">
                Parameters
                <Tooltip
                  arrow
                  title="The set of expansion request parameters that were used to control how this expansion was evaluated. Each expansion may use a different set of parameters."
                >
                  <InfoIcon color="primary" style={{ marginLeft: '10px' }} fontSize="small" />
                </Tooltip>
              </h3>
              <pre style={{ marginTop: 0 }}>{JSON.stringify(openExpansionDialog.parameters, undefined, 2)}</pre>
            </div>
            <Divider />

            <h3 className="flex-vertical-center" style={{ margin: '8px 0' }}>
              Resolved Repo Versions
              <Tooltip arrow title="The set of repository versions that were used in the evaluation of this expansion.">
                <InfoIcon color="primary" style={{ marginLeft: '10px' }} fontSize="small" />
              </Tooltip>
            </h3>

            <div>
              <h4 className="flex-vertical-center" style={{ margin: '8px 0' }}>
                {`Explicit Repo Versions:  ${[...openExpansionDialog.explicit_source_versions, ...openExpansionDialog.explicit_collection_versions]?.length?.toLocaleString()}`}
              </h4>
              <div className="col-xs-11 no-side-padding">
                <SourceChildVersionAssociationWithContainer
                  associatedWith={{
                    source: map(openExpansionDialog.explicit_source_versions, 'version_url'),
                    collection: map(openExpansionDialog.explicit_collection_versions, 'version_url'),
                  }}
                />
              </div>
            </div>

            <div>
              <h4 className="flex-vertical-center" style={{ margin: '8px 0' }}>
                {`Evaluated Repo Versions:  ${[
                  ...openExpansionDialog.evaluated_source_versions,
                  ...openExpansionDialog.evaluated_collection_versions,
                ]?.length?.toLocaleString()}`}
              </h4>
              <div className="col-xs-11 no-side-padding">
                <SourceChildVersionAssociationWithContainer
                  associatedWith={{
                    source: map(openExpansionDialog.evaluated_source_versions, 'version_url'),
                    collection: map(openExpansionDialog.evaluated_collection_versions, 'version_url'),
                  }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExpansionDialog(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {pagination?.count ? (
        <div className="col-xs-12" style={{ textAlign: 'center', marginTop: '12px' }}>
          <TablePagination
            component="div"
            count={pagination.count}
            page={pagination.page - 1}
            onPageChange={loadMore}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default VersionList;
