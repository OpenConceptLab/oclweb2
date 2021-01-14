import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton,
} from '@material-ui/core';
import { map, isEmpty, startCase, get } from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon
} from '@material-ui/icons';
import APIService from '../../services/APIService';
import { headFirst } from '../../common/utils';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import ResourceVersionLabel from './ResourceVersionLabel';
import ConceptContainerTip from './ConceptContainerTip';
import SourceVersionForm from '../sources/SourceVersionForm';
import CommonFormDrawer from './CommonFormDrawer';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'scroll', display: 'inline-block', width: '100%'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const ConceptContainerVersionList = ({ versions, resource, canEdit }) => {
  let sortedVersions = headFirst(versions);
  const [versionForm, setVersionForm] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState();
  const onEditClick = version => {
    setSelectedVersion(version)
    setVersionForm(true)
  }
  const deleteVersion = version => {
    APIService.new().overrideURL(version.version_url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Source Version Deleted', 1, () => window.location.reload())
      else
        alertifyjs.error('Something bad happened!')
    })
  }
  const onEditCancel = () => setVersionForm(false);
  const onDeleteClick = version => {
    const title = `Delete Source Version : ${version.short_code} [${version.id}]`;
    const message = `Are you sure you want to permanently delete this source version ${version.id}? This action cannot be undone! This will delete the version and all of its details. Concepts and mappings in this source version will not be affected.`

    const confirm = alertifyjs.confirm()
    confirm.setHeader(title);
    confirm.setMessage(message);
    confirm.set('onok', () => deleteVersion(version));
    confirm.show();
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
              map(sortedVersions, (version, index) => (
                <div className='col-md-12 no-side-padding' key={index}>
                  <div className='col-md-12 no-side-padding flex-vertical-center' style={{margin: '10px 0'}}>
                    <div className='col-md-9 no-left-padding'>
                      <div className='col-md-12 no-side-padding' style={{marginBottom: '5px'}}>
                        <ResourceVersionLabel {...version} />
                      </div>
                      <div className='col-md-12'>
                        <span>{version.description}</span>
                      </div>
                      <div className='col-md-12'>
                        <LastUpdatedOnLabel
                          by={version.created_by}
                          date={version.created_on}
                          label='Created on'
                        />
                      </div>
                    </div>
                    <div className='col-md-3 no-right-padding' style={{textAlign: 'right'}}>
                      {
                        canEdit && version.id.toLowerCase() !== 'head' &&
                        <React.Fragment>
                          <Tooltip title='Edit Version'>
                            <IconButton onClick={() => onEditClick(version)}>
                              <EditIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete Version'>
                            <IconButton onClick={() => onDeleteClick(version)}>
                              <DeleteIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                        </React.Fragment>
                      }
                      <Tooltip title='Version Link'>
                        <IconButton href={`#${version.concepts_url}`} color='primary'>
                          <SearchIcon fontSize='inherit' />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                  {
                    (index + 1) < versions.length &&
                    <Divider style={{width: '100%'}} />
                  }
                </div>
              ))
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
          <SourceVersionForm onCancel={onEditCancel} reloadOnSuccess edit parentURL={get(selectedVersion, 'version_url')} version={selectedVersion} />
        }
      />
    </div>
  );
}

export default ConceptContainerVersionList;
