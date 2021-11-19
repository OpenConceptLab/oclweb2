import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Divider, Tooltip,
  IconButton, CircularProgress, Card, CardContent, Collapse
} from '@material-ui/core';
import { map, isEmpty, startCase, get, includes, merge, orderBy, last, find, reject } from 'lodash';
import {
  Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, Block as RetireIcon,
  AccountTreeRounded as VersionIcon,
  AspectRatio as ExpansionIcon,
  NewReleases as ReleaseIcon, FileCopy as CopyIcon,
  CheckCircle as DefaultIcon, BrightnessAuto as AutoIcon,
} from '@material-ui/icons';
import APIService from '../../services/APIService';
import { headFirst, copyURL, toFullAPIURL } from '../../common/utils';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ConceptContainerVersionForm from '../common/ConceptContainerVersionForm';
import CommonFormDrawer from '../common/CommonFormDrawer';
import ConceptContainerExport from '../common/ConceptContainerExport';
import CollapsibleDivider from '../common/CollapsibleDivider';
import { GREEN } from '../../common/constants';

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

const VersionList = ({ versions, canEdit, onUpdate }) => {
  const resource = 'collection'
  const sortedVersions = headFirst(versions);
  const [versionForm, setVersionForm] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
  const [expansions, setExpansions] = React.useState({})
  const [open, setOpen] = React.useState({})
  const [loadingExpansions, setLoadingExpansions] = React.useState({})
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
      let _expansions = orderBy(response.data, 'id', 'desc')
      if(version.autoexpand) {
        _expansions = [{...last(_expansions), auto: true}, ..._expansions.slice(0, -1)]
      }
      if(version.expansion_url) {
        const defaultExpansion = find(_expansions, {url: version.expansion_url})
        const otherExpansions = reject(_expansions, {url: version.expansion_url})
        _expansions = [{...defaultExpansion, "default": true}, ...otherExpansions]
      }
      setExpansions({...expansions, [version.uuid]: _expansions})
      setLoadingExpansions({...loadingExpansions, [version.uuid]: false})
    })
  }

  const isExpansionsLoaded = version => Boolean(!isEmpty(get(expansions, version.uuid)))
  const isExpansionsLoading = version => Boolean(get(loadingExpansions, version.uuid))

  const toggleOpen = version => {
    const newOpen = !get(open, version.uuid)
    if(newOpen && !isExpansionsLoaded(version))
      fetchExpansions(version)
    setOpen({...open, [version.uuid]: newOpen})
  }

  return (
    <div className='col-md-12 no-side-padding'>
      {
        map(sortedVersions, version => {
          const isHEAD = version.id.toLowerCase() === 'head';
          const isOpen = get(open, version.uuid)
          const hasExpansions = version.summary.expansions > 0;
          const isLoadingExpansions = get(loadingExpansions, version.uuid)
          const style = hasExpansions ? {margin: '5px 0', borderBottom: 'none'} : {margin: '5px 0'}
          if(isOpen)
            style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
          const versionExpansions = get(expansions, version.uuid, [])
          return (
            <Card key={version.uuid} variant="outlined" style={style}>
              <CardContent style={{display: 'flex', paddingBottom: isOpen ? '0px' : '8px'}}>
                <div className='col-md-4 no-side-padding'>
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
                </div>
                <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                <div className='col-md-3 no-side-padding' style={{display: 'flex', justifyContent: 'center'}}>
                  <div className='col-md-6' style={{textAlign: 'center'}}>
                    <div className='col-md-12 no-side-padding gray-italics'>References</div>
                    <div className='col-md-12 no-side-padding'>{version.summary.active_references}</div>
                  </div>
                  <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                  <div className='col-md-6' style={{textAlign: 'center'}}>
                    <div className='col-md-12 no-side-padding gray-italics'>Expansions</div>
                    <div className='col-md-12 no-side-padding'>{version.summary.expansions}</div>
                  </div>
                </div>
                <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                <div className='col-md-4' style={{textAlign: 'center'}}>
                  {
                    canEdit && !isHEAD &&
                    <React.Fragment>
                      <Tooltip arrow title='Edit Version'>
                        <IconButton onClick={() => onEditClick(version)}>
                          <EditIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title={version.released ? 'UnRelease Version' : 'Release Version'}>
                        <IconButton color={version.released ? 'primary' : 'default' } onClick={() => onReleaseClick(version)}>
                          <ReleaseIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title={version.retired ? 'UnRetire Version' : 'Retire Version'}>
                        <IconButton className={version.retired ? 'retired-red' : ''} color={version.retired ? 'primary' : 'default' } onClick={() => onRetireClick(version)}>
                          <RetireIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip arrow title='Delete Version'>
                        <IconButton disabled={version.retired} onClick={() => onDeleteClick(version)}>
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
                      size='medium'
                    />
                  }
                  <Tooltip arrow title='Explore Version'>
                    <IconButton href={`#${version.concepts_url}`} color='primary'>
                      <SearchIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip arrow title='Copy URL'>
                    <IconButton onClick={() => onCopyClick(version.version_url)}>
                      <CopyIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                </div>
              </CardContent>
              <Collapse in={isOpen} className="col-md-12" style={{display: `${open ? 'block' : 'none'}`, padding: '0 20px'}}>
                {
                  isLoadingExpansions ?
                  <CircularProgress /> :
                  (
                    map(versionExpansions, expansion => {
                      const isDefault = expansion.default
                      const isAuto = expansion.auto
                      const iconStyle = {width: '16px', marginRight: '5px'}
                      const cardStyle = {margin: '5px 0'}
                      if(isDefault) {
                        cardStyle.borderColor = GREEN
                      }
                      return (
                        <Card key={expansion.id} variant="outlined" style={cardStyle}>
                          <CardContent style={{display: 'flex', paddingBottom: '8px'}}>
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
                              <span style={{display: 'inline-block'}}>
                                <LastUpdatedOnLabel
                                  by={expansion.created_by}
                                  date={expansion.created_on}
                                  label='Created'
                                />
                              </span>
                            </div>
                            <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                            <div className='col-md-3 no-side-padding' style={{display: 'flex', justifyContent: 'center'}}>
                              <div className='col-md-6' style={{textAlign: 'center'}}>
                                <div className='col-md-12 no-side-padding gray-italics'>Concepts</div>
                                <div className='col-md-12 no-side-padding'>{expansion.summary.active_concepts}</div>
                              </div>
                              <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                              <div className='col-md-6' style={{textAlign: 'center'}}>
                                <div className='col-md-12 no-side-padding gray-italics'>Mappings</div>
                                <div className='col-md-12 no-side-padding'>{expansion.summary.active_mappings}</div>
                              </div>
                            </div>
                            <Divider orientation='vertical' style={{height: '50px', margin: '0 15px'}}/>
                            <div className='col-md-4' style={{textAlign: 'center'}}>
                              {
                                canEdit &&
                                <Tooltip arrow title='Delete Expansion'>
                                  <span>
                                  <IconButton disabled={expansion.retired || isAuto || isDefault} onClick={() => onDeleteExpansionClick(expansion)}>
                                    <DeleteIcon fontSize='inherit' />
                                  </IconButton>
                                  </span>
                                </Tooltip>
                              }
                              <Tooltip arrow title='Explore Expansion'>
                                <IconButton href={`#${expansion.url}`} color='primary'>
                                  <SearchIcon fontSize='inherit' />
                                </IconButton>
                              </Tooltip>
                              <Tooltip arrow title='Copy URL'>
                                <IconButton onClick={() => onCopyClick(expansion.url)}>
                                  <CopyIcon fontSize='inherit' />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )
                }
              </Collapse>
              {
                hasExpansions &&
                <CollapsibleDivider
                  open={isOpen}
                  tooltip='View Expansions'
                  onClick={() => toggleOpen(version)}
                  width='50%'
                  style={isOpen ? {} : {marginTop: '-15px'}}
                />
              }
            </Card>
          )
        })
      }
      <CommonFormDrawer
        isOpen={versionForm}
        onClose={onEditCancel}
        formComponent={
          <ConceptContainerVersionForm onCancel={onEditCancel} edit parentURL={get(selectedVersion, 'version_url')} version={selectedVersion} onSubmit={onUpdate} resource={resource} />
        }
      />
    </div>
  )
}

export default VersionList;
