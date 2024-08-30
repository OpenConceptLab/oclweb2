import React from 'react';
import { Link } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton, CircularProgress, Chip
} from '@mui/material';
import { map, isEmpty, startCase, get, includes, merge } from 'lodash';
import {
  Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, Block as RetireIcon,
  NewReleases as ReleaseIcon, FileCopy as CopyIcon,
  Functions as SummaryIcon
} from '@mui/icons-material';
import APIService from '../../services/APIService';
import { headFirst, copyURL, toFullAPIURL } from '../../common/utils';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import ResourceVersionLabel from './ResourceVersionLabel';
import ConceptContainerTip from './ConceptContainerTip';
import ConceptContainerVersionForm from './ConceptContainerVersionForm';
import CommonFormDrawer from './CommonFormDrawer';
import ConceptContainerExport from './ConceptContainerExport';
import { CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS } from '../search/ResultConstants';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%'
}


const StateChip = ({label, state}) => {
  const getColorByTaskState = state => {
    if(state === 'SUCCESS')
      return 'success'
    if(state === 'REVOKED')
      return 'default'
    if (state === 'FAILED')
      return 'error'
    if (['RECEIVED', 'STARTED'].includes(state))
      return 'warning'
    return 'info'
  }

  return state ? (
        <Tooltip title={state}>
          <Chip
            variant='outlined'
            sx={{fontSize: '10px', marginRight: '4px'}}
            size='small'
            label={label}
            color={getColorByTaskState(state)}
          />
        </Tooltip>
  ) : null
}

const getTag = (tag, item) => {
  let value = get(item, tag.value, null)
  value = value === null ? '-' : value.toLocaleString()

  return (
    <Tooltip arrow title={tag.label} key={tag.id}>
      <div style={{fontSize: '14px', lineHeight: '0px', marginBottom: '2px'}}>
        <div className='flex-vertical-center'>
          <span>{tag.icon}</span>
          <span style={{padding: '2px'}}>{value}</span>
        </div>
      </div>
    </Tooltip>
  )
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const onCopyClick = version => copyURL(toFullAPIURL(version.version_url));
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
const getService = version => APIService.new().overrideURL(version.version_url)
const deleteVersion = version => getService(version).delete().then(response => handleResponse(response, version.type, 'Deleted'))
const updateVersion = (version, data, verb, successCallback) => getService(version).put(data).then(response => handleResponse(response, version.type, verb, updatedVersion => successCallback(merge(version, updatedVersion))))

const ConceptContainerVersionList = ({ versions, resource, canEdit, onUpdate, fhir, isLoading }) => {
  const sortedVersions = headFirst(versions);
  const [versionForm, setVersionForm] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
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


  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordion-header'
            expandIcon={<span />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`${startCase(resource)} Version History`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoading ?
              <div style={{width: '100%', textAlign: 'center'}}>
                <CircularProgress color='primary' />
              </div> :
              (
                isEmpty(sortedVersions) ?
                None() :
                map(sortedVersions, (version, index) => {
                  const isHEAD = version.id.toLowerCase() === 'head';
                  return (
                    <div className='col-md-12 no-side-padding' key={index}>
                      <div className='col-md-12 no-side-padding flex-vertical-center' style={{margin: '10px 0'}}>
                        <div className='col-md-9 no-side-padding'>
                          <div className='col-md-12 no-side-padding' style={{marginBottom: '5px'}}>
                            {
                              fhir ?
                              <ResourceVersionLabel {...version} short_code={version.id} /> :
                              <ResourceVersionLabel {...version} showAccess />
                            }
                          </div>
                          <div className='col-md-12'>
                            <span>{version.description}</span>
                          </div>
                          <div className='col-md-12'>
                            <LastUpdatedOnLabel
                              by={version.created_by}
                              date={fhir ? version.date : version.created_on}
                              label={fhir ? 'Released' : 'Created'}
                              timeTakenLabel='Export Time'
                              timeTaken={version?.extras?.__export_time || false}
                              containerStyle={{display: 'flex'}}
                            />
                          </div>
                          {
                            !isEmpty(version.states) &&
                              <div className='col-md-12'>
                                <StateChip label='Seeded Concepts' state={version.states.seeded_concepts} />
                                <StateChip label='Seeded Mappings' state={version.states.seeded_mappings} />
                                <StateChip label='Indexed Concepts' state={version.states.indexed_concepts} />
                                <StateChip label='Indexed Mappings' state={version.states.indexed_mappings} />
                                <StateChip label='Export' state={version.states.exported} />
                              </div>
                          }
                        </div>
                        <div className='col-md-3 no-right-padding version-button-controls-container'>
                          {
                            !fhir &&
                            <div className='col-md-12 no-side-padding' style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '5px'}}>
                              {
                                version.summary ?
                                map(CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS, (tag, i) => (
                                  <Link to={version[tag.hrefAttr]} key={tag.id} style={i === 0 ? {marginRight: '10px'} : {}}>
                                    {getTag(tag, version)}
                                  </Link>
                                )) :
                                <CircularProgress style={{width: '20px', height: '20px'}} />
                              }
                            </div>
                          }
                          <div className='col-md-12 no-side-padding'>
                            {
                              canEdit && !isHEAD &&
                              <React.Fragment>
                                <Tooltip arrow title='Edit Version'>
                                  <IconButton onClick={() => onEditClick(version)} size='small'>
                                    <EditIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title={version.released ? 'UnRelease Version' : 'Release Version'}>
                                  <IconButton color={version.released ? 'primary' : 'default' } onClick={() => onReleaseClick(version)} size='small'>
                                    <ReleaseIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title={version.retired ? 'UnRetire Version' : 'Retire Version'}>
                                  <IconButton className={version.retired ? 'retired-red' : ''} color={version.retired ? 'primary' : 'default' } onClick={() => onRetireClick(version)} size='small'>
                                    <RetireIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='Delete Version'>
                                  <IconButton disabled={version.retired} onClick={() => onDeleteClick(version)} size='small'>
                                    <DeleteIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </React.Fragment>
                            }
                            {
                              version && !fhir &&
                              <ConceptContainerExport
                                isHEAD={isHEAD}
                                title={`Export ${startCase(resource)} Version: ${version.short_code} / ${version.id}`}
                                version={version}
                                resource={resource}
                              />
                            }
                            {
                              canEdit && version && !fhir &&
                                <Tooltip arrow title='Re-compute Summary'>
                                  <IconButton onClick={() => onComputeSummaryClick(version)} size='small'>
                                    <SummaryIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                            }
                            {
                              !fhir &&
                              <React.Fragment>
                                <Tooltip arrow title='Explore Version'>
                                  <IconButton href={`#${version.concepts_url}`} color='primary' size='small'>
                                    <SearchIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='Copy URL'>
                                  <IconButton onClick={() => onCopyClick(version)} size='small'>
                                    <CopyIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </React.Fragment>
                            }
                          </div>
                        </div>
                      </div>
                      {
                        (index + 1) < versions.length && <Divider style={{width: '100%', display: 'inline-block'}} />
                      }
                    </div>
                  )
                })
              )
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-4 no-right-padding'>
        <ConceptContainerTip resource={resource} />
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={versionForm}
        onClose={onEditCancel}
        formComponent={
          <ConceptContainerVersionForm onCancel={onEditCancel} edit parentURL={get(selectedVersion, 'version_url')} version={selectedVersion} onSubmit={onUpdate} resource={resource} />
        }
      />
    </div>
  );
}

export default ConceptContainerVersionList;
