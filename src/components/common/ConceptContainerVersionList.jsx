import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton,
} from '@material-ui/core';
import { map, isEmpty, startCase, get, includes, merge } from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon, Edit as EditIcon,
  Delete as DeleteIcon, Block as RetireIcon,
  NewReleases as ReleaseIcon, FileCopy as CopyIcon,
} from '@material-ui/icons';
import APIService from '../../services/APIService';
import { headFirst, copyURL, toFullAPIURL } from '../../common/utils';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import ResourceVersionLabel from './ResourceVersionLabel';
import ConceptContainerTip from './ConceptContainerTip';
import ConceptContainerVersionForm from './ConceptContainerVersionForm';
import CommonFormDrawer from './CommonFormDrawer';
import ConceptContainerExport from './ConceptContainerExport';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block', width: '100%'
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

const ConceptContainerVersionList = ({ versions, resource, canEdit, onUpdate, fhir }) => {
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

  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>{`${startCase(resource)} Version History`}</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
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
                            <ResourceVersionLabel {...version} />
                          }
                        </div>
                        <div className='col-md-12'>
                          <span>{version.description}</span>
                        </div>
                        <div className='col-md-12'>
                          <LastUpdatedOnLabel
                            by={version.created_by}
                            date={fhir ? version.date : version.created_on}
                            label={fhir ? 'Released on ' : 'Created on'}
                          />
                        </div>
                      </div>
                      <div className='col-md-3 no-right-padding version-button-controls-container'>
                        {
                          canEdit && !isHEAD &&
                          <React.Fragment>
                            <Tooltip title='Edit Version'>
                              <IconButton onClick={() => onEditClick(version)} size='small'>
                                <EditIcon fontSize='inherit' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={version.released ? 'UnRelease Version' : 'Release Version'}>
                              <IconButton color={version.released ? 'primary' : 'default' } onClick={() => onReleaseClick(version)} size='small'>
                                <ReleaseIcon fontSize='inherit' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={version.retired ? 'UnRetire Version' : 'Retire Version'}>
                              <IconButton className={version.retired && 'retired-red'} color={version.retired ? 'primary' : 'default' } onClick={() => onRetireClick(version)} size='small'>
                                <RetireIcon fontSize='inherit' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Delete Version'>
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
                            title={`Export Version ${version.id}`}
                            version={version}
                          />
                        }
                        {
                          !fhir &&
                          <React.Fragment>
                            <Tooltip title='Explore Version'>
                              <IconButton href={`#${version.concepts_url}`} color='primary' size='small'>
                                <SearchIcon fontSize='inherit' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Copy URL'>
                              <IconButton onClick={() => onCopyClick(version)} size='small'>
                                <CopyIcon fontSize='inherit' />
                              </IconButton>
                            </Tooltip>
                          </React.Fragment>
                        }
                      </div>
                    </div>
                    {
                      (index + 1) < versions.length && <Divider style={{width: '100%'}} />
                    }
                  </div>
                )
              })
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-4 no-right-padding'>
        <ConceptContainerTip resource={resource} />
      </div>
      <CommonFormDrawer
        isOpen={versionForm}
        onClose={onEditCancel}
        formComponent={
          <ConceptContainerVersionForm onCancel={onEditCancel} edit parentURL={get(selectedVersion, 'version_url')} version={selectedVersion} onSubmit={onUpdate} />
        }
      />
    </div>
  );
}

export default ConceptContainerVersionList;
