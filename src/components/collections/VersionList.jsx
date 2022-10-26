import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Divider, Tooltip, Button, IconButton, CircularProgress, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  map, isEmpty, startCase, get, includes, merge, orderBy, last, find, reject, forEach
} from 'lodash';
import {
  Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, Block as RetireIcon,
  AccountTreeRounded as VersionIcon,
  AspectRatio as ExpansionIcon,
  NewReleases as ReleaseIcon, FileCopy as CopyIcon,
  CheckCircle as DefaultIcon, BrightnessAuto as AutoIcon,
  MenuOpen as ViewParametersIcon,
  Info as InfoIcon,
  Functions as SummaryIcon
} from '@mui/icons-material';
import APIService from '../../services/APIService';
import { headFirst, copyURL, toFullAPIURL } from '../../common/utils';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ConceptContainerVersionForm from '../common/ConceptContainerVersionForm';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptContainerExport from '../common/ConceptContainerExport';
import { GREEN } from '../../common/constants';
import SourceChildVersionAssociationWithContainer from '../common/SourceChildVersionAssociationWithContainer';

const onCopyClick = url => copyURL(toFullAPIURL(url));
const handleResponse = (response, resource, action, successCallback) => {
  if(includes([200, 204], get(response, 'status')))
    alertifyjs.success(`${resource} Version ${action}`, 1, () => {
      if(successCallback)
        successCallback(response.data)
      else
        window.location.reload()
    })
  else
    alertifyjs.error('Something bad happened!')
}
const handleExpansionResponse = (response, action, successCallback) => {
  if(includes([200, 204], get(response, 'status')))
    alertifyjs.success(`Collection Expansion ${action}`, 1, () => {
      if(successCallback)
        successCallback(response.data)
      else
        window.location.reload()
    })
  else
    alertifyjs.error('Something bad happened!')
}
const getService = version => APIService.new().overrideURL(version.version_url)
const deleteVersion = version => getService(version).delete().then(response => handleResponse(response, version.type, 'Deleted'))
const updateVersion = (version, data, verb, successCallback) => getService(version).put(data).then(response => handleResponse(response, version.type, verb, updatedVersion => successCallback(merge(version, updatedVersion))))
const deleteExpansion = expansion => APIService.new().overrideURL(expansion.url).delete().then(response => handleExpansionResponse(response, 'Deleted'))

const VersionList = ({ versions, canEdit, onUpdate, onCreateExpansionClick }) => {
  const resource = 'collection'
  const sortedVersions = headFirst(versions)
  const [versionForm, setVersionForm] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
  const [expansions, setExpansions] = React.useState({})
  const [loadingExpansions, setLoadingExpansions] = React.useState({})
  const [openExpansionDialog, setOpenExpansionDialog] = React.useState(false);
  const onEditClick = version => {
    setSelectedVersion(version)
    setVersionForm(true)
  }
  const onEditCancel = () => setVersionForm(false);
  const onReleaseClick = version => onVersionUpdate(version, 'released', 'release', 'Released')
  const onRetireClick = version => onVersionUpdate(version, 'retired', 'retire', 'Retired')
  const onDeleteClick = version => {
    const title = `Delete ${startCase(resource)} Version : ${version.short_code} [${version.id}]`;
    const message = `Are you sure you want to permanently delete this ${resource} version ${version.id}? This action cannot be undone! This will delete the version and all of its details. Concepts and mappings in this ${resource} version will not be affected.`

    handleOnClick(title, message, () => deleteVersion(version))
  }
  const onDeleteExpansionClick = expansion => {
    const title = `Delete Collection Expansion : ${expansion.mnemonic}`;
    const message = `Are you sure you want to permanently delete this collection expansion? This action cannot be undone! This will delete the expansion and all of its details. Concepts and mappings in this collection expansion will not be affected.`

    handleOnClick(title, message, () => deleteExpansion(expansion))
  }
  const onMarkExpansionDefault = (version, expansion) => {
    const service = getService(version)
    if(version.version === 'HEAD')
      service.appendToUrl('HEAD/')
    service.put({expansion_url: expansion.url}).then(response => {
      if(response.status === 200){
        alertifyjs.success('Successfully marked expansion as version default')
        onUpdate({...version, expansion_url: expansion.url})
        const newExpansions = getFormattedExpansions({...version, expansion_url: expansion.url}, expansions[version.uuid]);
        setExpansions({...expansions, [version.uuid]: newExpansions})
      }
    })
  }
  const handleOnClick = (title, message, onOk) => {
    const confirm = alertifyjs.confirm()
    confirm.setHeader(title);
    confirm.setMessage(message);
    confirm.set('onok', onOk);
    confirm.show();
  }
  const onVersionUpdate = (version, attr, label, successLabel) => {
    const newValue = !get(version, attr)
    label = newValue ? label : `un-${label}`;
    const resLabel = newValue ? successLabel : `Un${successLabel}`
    const title = `Update ${startCase(resource)} Version : ${version.short_code} [${version.id}]`;
    const message = `Are you sure you want to ${label} this ${resource} version ${version.id}?`

    handleOnClick(title, message, () => updateVersion(version, {[attr]: newValue}, resLabel, onUpdate))
  }
  const fetchExpansions = version => {
    if(isExpansionsLoading(version))
      return
    setLoadingExpansions({...loadingExpansions, [version.uuid]: true})
    const isHEAD = version.id.toLowerCase() === 'head';
    const service = getService(version)
    if(isHEAD)
      service.appendToUrl('HEAD/')

    service.appendToUrl('expansions/?includeSummary=true&verbose=true').get().then(response => {
      setExpansions(prevExpansions => ({...prevExpansions, [version.uuid]: getFormattedExpansions(version, response.data)}))
      setLoadingExpansions(prevLoading => ({...prevLoading, [version.uuid]: false}))
    })
  }

  const getFormattedExpansions = (version, versionExpansions) => {
    if(isEmpty(versionExpansions))
      return []
    let _expansions = map(orderBy(versionExpansions, 'id', 'desc'), expansion => ({...expansion, "default": false}))
    if(version.autoexpand) {
      _expansions = [{...last(_expansions), auto: true}, ..._expansions.slice(0, -1)]
    }
    if(version.expansion_url) {
      const defaultExpansion = find(_expansions, {url: version.expansion_url})
      const otherExpansions = reject(_expansions, {url: version.expansion_url})
      if(defaultExpansion)
        _expansions = [{...defaultExpansion, "default": true}, ...otherExpansions]
    }
    return _expansions
  }

  const isExpansionsLoaded = version => Boolean(!isEmpty(get(expansions, version.uuid)))
  const isExpansionsLoading = version => Boolean(get(loadingExpansions, version.uuid))

  const fetchExpansionsForAllVersions = () => {
    forEach(versions, version => {
      if(version && !isExpansionsLoaded(version) && !isExpansionsLoading(version)) {
        fetchExpansions(version)
      }
    })
  }

  const onComputeSummaryClick = version => {
    APIService.new().overrideURL(version.version_url).appendToUrl('summary/').put().then(response => {
      if(response.detail || response.error)
        alertifyjs.error(response.detail || response.error, 5)
      else if(response.status === 202)
        alertifyjs.success('The request is in queue. It may take few minutes to update the summary depending on the size of repository. Please revisit in few minutes.', 10)
      else
        alertifyjs.error('Something went wrong.', 5)
    })
  }

  React.useEffect(() => fetchExpansionsForAllVersions(), [versions])

  return (
    <div className='col-md-12 no-side-padding'>
      {
        map(sortedVersions, version => {
          const isHEAD = version.id.toLowerCase() === 'head';
          const isLoadingExpansions = isExpansionsLoading(version)
          const style = {margin: '5px 0'}
          const versionExpansions = get(expansions, version.uuid, [])
          return (
            <Card key={version.uuid} variant="outlined" style={style}>
              <CardContent style={{display: 'flex', padding: '0px'}}>
                <div className='col-md-3' style={{backgroundColor: 'rgba(0, 0, 0, 0.04)', padding: '5px 10px'}}>
                  <div className='col-md-12 flex-vertical-center no-side-padding'>
                    <span style={{paddingTop: '5px'}}>
                      <VersionIcon style={{marginRight: '5px', width: '16px'}} />
                    </span>
                    <span><b>{version.version}</b></span>
                    {
                      version.autoexpand &&
                        <span style={{paddingTop: '5px'}}>
                          <Tooltip arrow title='Auto Expanded' placement='right'>
                            <ExpansionIcon style={{color: GREEN, marginLeft: '15px', width: '16px'}} />
                          </Tooltip>
                        </span>
                    }
                  </div>
                  <span style={{display: 'inline-block'}}>
                    <LastUpdatedOnLabel
                      by={version.created_by}
                      date={version.created_on}
                      label='Created'
                    />
                  </span>
                  <div className='col-md-12 no-side-padding' style={{marginTop: '-5px'}}>
                    <div className='col-md-4 no-left-padding'>
                      <span className='gray-italics'>References:</span>
                      <span>{version.summary.active_references}</span>
                    </div>
                    <div className='col-md-4'>
                      <span className='gray-italics'>Expansions:</span>
                      <span>{version.summary.expansions}</span>
                    </div>
                  </div>
                  <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
                    {
                      canEdit && !isHEAD &&
                        <React.Fragment>
                          <Tooltip arrow title='Edit Version'>
                            <IconButton onClick={() => onEditClick(version)} size="small">
                              <EditIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip arrow title={version.released ? 'UnRelease Version' : 'Release Version'}>
                            <IconButton
                              color={version.released ? 'primary' : 'default' }
                              onClick={() => onReleaseClick(version)}
                              size="small">
                              <ReleaseIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip arrow title={version.retired ? 'UnRetire Version' : 'Retire Version'}>
                            <IconButton
                              className={version.retired ? 'retired-red' : ''}
                              color={version.retired ? 'primary' : 'default' }
                              onClick={() => onRetireClick(version)}
                              size="small">
                              <RetireIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip arrow title='Delete Version'>
                            <IconButton
                              disabled={version.retired}
                              onClick={() => onDeleteClick(version)}
                              size="small">
                              <DeleteIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                        </React.Fragment>
                    }
                    {
                      version &&
                        <ConceptContainerExport
                          isHEAD={isHEAD}
                          title={`Export Version ${version.id}`}
                          version={version}
                          resource='collection'
                          size='small'
                        />
                    }
                    {
                      version &&
                        <Tooltip arrow title='Re-compute Summary'>
                          <IconButton onClick={() => onComputeSummaryClick(version)} size='small'>
                            <SummaryIcon fontSize='inherit' />
                          </IconButton>
                        </Tooltip>
                    }
                    <Tooltip arrow title='Explore Version'>
                      <IconButton href={`#${version.concepts_url}`} color='primary' size="small">
                        <SearchIcon fontSize='inherit' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip arrow title='Copy URL'>
                      <IconButton onClick={() => onCopyClick(version.version_url)} size="small">
                        <CopyIcon fontSize='inherit' />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
                <div className='col-md-9' style={{padding: '2px 5px'}}>
                  {
                    isLoadingExpansions ?
                      <div className='col-md-12' style={{textAlign: 'center', marginTop: '20px'}}>
                        <CircularProgress />
                      </div> :
                    (
                      isEmpty(versionExpansions) && loadingExpansions[version.uuid] === false ?
                        <div className='flex-column-center' style={{height: '100%'}}>
                          {
                            canEdit ?
                              <Button
                                onClick={() => onCreateExpansionClick(version)}
                                variant="text"
                                size='small'
                                style={{textTransform: 'inherit'}}>
                                Create First Expansion for this version
                              </Button> :
                            <p>No expansions yet</p>
                          }
                        </div> :
                      map(versionExpansions, expansion => {
                        const isDefault = expansion.default
                        const isAuto = expansion.auto
                        const iconStyle = {width: '16px', marginRight: '5px'}
                        const cardStyle = {margin: '2px 0'}
                        if(isDefault) {
                          cardStyle.borderColor = GREEN
                        }
                        return (
                          <Card key={expansion.id} variant="outlined" style={cardStyle}>
                            <CardContent style={{display: 'flex', padding: '0px 10px', alignItems: 'center'}}>
                              <div className='col-md-4 no-side-padding'>
                                <div className='col-md-12 flex-vertical-center no-side-padding'>
                                  <span style={{paddingTop: '5px'}}>
                                    <ExpansionIcon style={iconStyle} />
                                  </span>
                                  <span><b>{expansion.mnemonic}</b></span>
                                  {
                                    isDefault &&
                                      <span style={{paddingTop: '5px'}}>
                                        <Tooltip arrow title='Default Expansion' placement='right'>
                                          <DefaultIcon style={{color: GREEN, marginLeft: '10px', width: '16px'}} />
                                        </Tooltip>
                                      </span>
                                  }
                                  {
                                    isAuto &&
                                      <span style={{paddingTop: '5px'}}>
                                        <Tooltip arrow title='Auto Generated Expansion' placement='right'>
                                          <AutoIcon style={{marginLeft: '10px', width: '16px'}} />
                                        </Tooltip>
                                      </span>
                                  }
                                </div>
                                <span>
                                  <LastUpdatedOnLabel
                                    by={expansion.created_by}
                                    date={expansion.created_on}
                                    label='Created'
                                  />
                                </span>
                              </div>
                              <Divider orientation='vertical' style={{height: '50px'}}/>
                              <div className='col-md-3 no-side-padding' style={{display: 'flex'}}>
                                <div className='col-md-6 flex-column-center'>
                                  <div className='col-md-12 no-side-padding gray-italics'>Concepts</div>
                                  <div className='col-md-12 no-side-padding'>{expansion.summary.active_concepts}</div>
                                </div>
                                <Divider orientation='vertical' style={{height: '50px'}}/>
                                <div className='col-md-6 flex-column-center'>
                                  <div className='col-md-12 no-side-padding gray-italics'>Mappings</div>
                                  <div className='col-md-12 no-side-padding'>{expansion.summary.active_mappings}</div>
                                </div>
                              </div>
                              <Divider orientation='vertical' style={{height: '50px'}}/>
                              <div className='col-md-4' style={{textAlign: 'center'}}>
                                <Tooltip arrow title={isDefault ? 'Default Expansion' : 'Mark this expansion as default'}>
                                  <span>
                                    <IconButton
                                      disabled={isDefault}
                                      onClick={() => onMarkExpansionDefault(version, expansion)}
                                      size="medium">
                                      <DefaultIcon fontSize='inherit' />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                {
                                  canEdit &&
                                    <Tooltip arrow title='Delete Expansion'>
                                      <span>
                                        <IconButton
                                          disabled={expansion.retired || isDefault}
                                          onClick={() => onDeleteExpansionClick(expansion)}
                                          size="medium">
                                          <DeleteIcon fontSize='inherit' />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                }
                                <Tooltip arrow title='Explore Expansion'>
                                  <IconButton href={`#${expansion.url}`} color='primary' size="medium">
                                    <SearchIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='Copy URL'>
                                  <IconButton onClick={() => onCopyClick(expansion.url)} size="medium">
                                    <CopyIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='View Expansion Parameters'>
                                  <IconButton onClick={() => setOpenExpansionDialog(expansion)} size="medium">
                                    <ViewParametersIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )
                  }
                </div>
              </CardContent>
            </Card>
          );
        })
      }
      {
        selectedVersion &&
          <CommonFormDrawer
            style={{zIndex: 1202}}
            isOpen={versionForm}
            onClose={onEditCancel}
            formComponent={
              <ConceptContainerVersionForm onCancel={onEditCancel} edit parentURL={get(selectedVersion, 'version_url')} version={selectedVersion} resource={resource} expansions={get(expansions, selectedVersion.uuid, [])} reloadOnSuccess />
            }
          />
      }
      {
        openExpansionDialog &&
          <Dialog open onClose={() => setOpenExpansionDialog(false)}>
            <DialogTitle>
              {`Expansion: ${openExpansionDialog.mnemonic}`}
            </DialogTitle>
            <DialogContent>
              <div>
                  <h3 className='flex-vertical-center'>
                  Parameters
                  <Tooltip arrow title='The set of expansion request parameters that were used to control how this expansion was evaluated. Each expansion may use a different set of parameters.'>
                    <InfoIcon color='primary' style={{marginLeft: '10px'}} fontSize='small' />
                    </Tooltip>
                </h3>
                <pre style={{marginTop: 0}}>{JSON.stringify(openExpansionDialog.parameters, undefined, 2)}</pre>
              </div>
              <Divider />
              <div>
                <h3 className='flex-vertical-center'>
                  Resolved Repo Versions
                  <Tooltip arrow title='The set of repository versions that were used in the evaluation of this expansion.'>
                    <InfoIcon color='primary' style={{marginLeft: '10px'}} fontSize='small' />
                  </Tooltip>
                </h3>
                <div className='col-xs-11 no-side-padding'>
                  <SourceChildVersionAssociationWithContainer
                    associatedWith={{
                      source: map(openExpansionDialog.resolved_source_versions, 'version_url'),
                      collection: map(openExpansionDialog.resolved_collection_versions, 'version_url')
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
      }
    </div>
  );
}

export default VersionList;
