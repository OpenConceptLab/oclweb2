import React from 'react';
import { Link } from 'react-router-dom';
import alertifyjs from 'alertifyjs';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton, CircularProgress
} from '@material-ui/core';
import { map, isEmpty, get, includes, merge } from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon,
  Delete as DeleteIcon, Block as RetireIcon,
  NewReleases as ReleaseIcon, FileCopy as CopyIcon,
} from '@material-ui/icons';
import APIService from '../../../services/APIService';
import { copyURL, toFullAPIURL } from '../../../common/utils';
import LastUpdatedOnLabel from '../../common/LastUpdatedOnLabel';
import ExpansionLabel from '../../common/ExpansionLabel';
import ConceptContainerTip from '../../common/ConceptContainerTip';
import ConceptContainerExport from '../../common/ConceptContainerExport';
import { CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS } from '../../search/ResultConstants';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%'
}

const getTag = (tag, item) => {
  const value = get(item, tag.value, '0').toLocaleString();
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

const onCopyClick = expansion => copyURL(toFullAPIURL(expansion.url));
const handleResponse = (response, action, successCallback) => {
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
const getService = expansion => APIService.new().overrideURL(expansion.url)
const deleteExpansion = expansion => getService(expansion).delete().then(response => handleResponse(response, 'Deleted'))
const updateExpansion = (expansion, data, verb, successCallback) => getService(expansion).put(data).then(response => handleResponse(response, verb, updatedExpansion => successCallback(merge(expansion, updatedExpansion))))

const Expansions = ({ collectionVersion, expansions, canEdit, onUpdate, fhir, isLoading }) => {
  const onReleaseClick = expansion => onExpansionUpdate(expansion, 'released', 'release', 'Released')
  const onRetireClick = expansion => onExpansionUpdate(expansion, 'retired', 'retire', 'Retired')
  const onDeleteClick = expansion => {
    const title = `Delete Collection Expansion : ${expansion.mnemonic}`;
    const message = `Are you sure you want to permanently delete this collection expansion ${expansion.mnemonic}? This action cannot be undone! This will delete the expansion and all of its details. Concepts and mappings in this collection expansion will not be affected.`

    handleOnClick(title, message, () => deleteExpansion(expansion))
  }
  const handleOnClick = (title, message, onOk) => {
    const confirm = alertifyjs.confirm()
    confirm.setHeader(title);
    confirm.setMessage(message);
    confirm.set('onok', onOk);
    confirm.show();
  }
  const onExpansionUpdate = (expansion, attr, label, successLabel) => {
    const newValue = !get(expansion, attr)
    label = newValue ? label : `un-${label}`;
    const resLabel = newValue ? successLabel : `Un${successLabel}`
    const title = `Update Collection Expansion : ${expansion.mnemonic}`;
    const message = `Are you sure you want to ${label} this collection expansion ${expansion.mnemonic}?`

    handleOnClick(title, message, () => updateExpansion(expansion, {[attr]: newValue}, resLabel, onUpdate))
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
            <Typography style={ACCORDIAN_HEADING_STYLES}>Collection Expansions</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isLoading ?
              <div style={{width: '100%', textAlign: 'center'}}>
                <CircularProgress color='primary' />
              </div> :
              (
                isEmpty(expansions) ?
                None() :
                map(expansions, (expansion, index) => {
                  return (
                    <div className='col-md-12 no-side-padding' key={index}>
                      <div className='col-md-12 no-side-padding flex-vertical-center' style={{margin: '10px 0'}}>
                        <div className='col-md-9 no-side-padding'>
                          <div className='col-md-12 no-side-padding' style={{marginBottom: '5px'}}>
                            <ExpansionLabel
                              {...expansion}
                              owner={collectionVersion.owner}
                              short_code={collectionVersion.short_code}
                              version={collectionVersion.version}
                            />
                          </div>
                          <div className='col-md-12'>
                            <span>{expansion.description}</span>
                          </div>
                          <div className='col-md-12'>
                            <LastUpdatedOnLabel
                              by={expansion.created_by}
                              date={expansion.created_on}
                              label='Created'
                            />
                          </div>
                        </div>
                        <div className='col-md-3 no-right-padding version-button-controls-container'>
                          {
                            !fhir &&
                            <div className='col-md-12 no-side-padding' style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '5px'}}>
                              {
                                expansion.summary ?
                                map(CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS, (tag, i) => (
                                  <Link to={expansion[tag.hrefAttr]} key={tag.id} style={i === 0 ? {marginRight: '10px'} : {}}>
                                    {getTag(tag, expansion)}
                                  </Link>
                                )) :
                                <CircularProgress style={{width: '20px', height: '20px'}} />
                              }
                            </div>
                          }
                          <div className='col-md-12 no-side-padding'>
                            {
                              canEdit &&
                              <React.Fragment>
                                <Tooltip arrow title={expansion.released ? 'UnRelease Expansion' : 'Release Expansion'}>
                                  <IconButton color={expansion.released ? 'primary' : 'default' } onClick={() => onReleaseClick(expansion)} size='small' disabled>
                                    <ReleaseIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title={expansion.retired ? 'UnRetire Expansion' : 'Retire Expansion'}>
                                  <IconButton className={expansion.retired && 'retired-red'} color={expansion.retired ? 'primary' : 'default' } onClick={() => onRetireClick(expansion)} size='small' disabled>
                                    <RetireIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='Delete Expansion'>
                                  <IconButton disabled={expansion.retired} onClick={() => onDeleteClick(expansion)} size='small'>
                                    <DeleteIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </React.Fragment>
                            }
                            {
                              expansion && !fhir &&
                              <ConceptContainerExport
                                title={`Export Collection Version Expansion: ${collectionVersion.version} / ${expansion.mnemonic}`}
                                version={expansion}
                                resource='collection'
                                disabled
                              />
                            }
                            {
                              !fhir &&
                              <React.Fragment>
                                <Tooltip arrow title='Explore Expansion'>
                                  <IconButton href={`#${expansion.url}`} color='primary' size='small'>
                                    <SearchIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip arrow title='Copy URL'>
                                  <IconButton onClick={() => onCopyClick(expansion)} size='small'>
                                    <CopyIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </React.Fragment>
                            }
                          </div>
                        </div>
                      </div>
                      {
                        (index + 1) < expansions.length && <Divider style={{width: '100%'}} />
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
        <ConceptContainerTip resource='collection' />
      </div>
    </div>
  );
}

export default Expansions;
