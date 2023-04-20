import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Divider, Tooltip,
  IconButton, Button, Checkbox, Collapse
} from '@mui/material';
import { map, isEmpty, startCase, uniq, without, orderBy } from 'lodash';
import {
  Search as SearchIcon, CompareArrows as CompareArrowsIcon,
  InfoOutlined as InfoIcon, ExpandLess as UpIcon,
  ExpandMore as DownIcon
} from '@mui/icons-material';
import { copyToClipboard } from '../../common/utils'
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import SourceChildVersionAssociationWithContainer from './SourceChildVersionAssociationWithContainer';
import RetiredChip from '../common/RetiredChip';
import TabCountLabel from '../common/TabCountLabel';
import BetaLabel from '../common/BetaLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  overflowX: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const _Checksum = ({ checksum }) => (
  <span
    style={{color: 'rgb(51, 115, 170)', marginLeft: '5px'}}
    onClick={() => copyToClipboard(checksum, 'Copied to Clipboard!')}>
    {checksum}
  </span>
)

const Checksum = ({ title, label, checksum }) => checksum ? (
  <Tooltip title={title} placement='left'>
    <div>
      <span>{label}:</span>
      <_Checksum checksum={checksum} />
    </div>
  </Tooltip>
) : null;


const VersionList = ({ versions, resource }) => {
  const sortedVersions = orderBy(versions, 'version_created_on', 'desc');
  const [selectedList, setSelectedList] = React.useState([]);
  const [expandChecksums, setExpandChecksums] = React.useState(false)
  const onSelectChange = (event, id) => setSelectedList(
    event.target.checked ? uniq([...selectedList, id]) : without(selectedList, id)
  )
  const isConcept = resource === 'concept';
  const isMapping = resource === 'mapping';
  const canSelect = (isConcept || isMapping) && sortedVersions.length > 1;
  const gridClass = canSelect ? 'col-md-11' : 'col-md-12'
  const showCompareOption = (isConcept || isMapping) && selectedList.length === 2;
  const onCompareClick = event => {
    event.stopPropagation()
    event.preventDefault()
    const url = `#/${resource}s/compare?lhs=${selectedList[0]}&rhs=${selectedList[1]}`
    window.open(url, '_blank')
  }

  return (
    <React.Fragment>
      <Accordion expanded style={{borderRadius: 'unset'}}>
        <AccordionSummary
          className='light-gray-bg less-paded-accordion-header'
          expandIcon={<span />}
          aria-controls="panel1a-content"
          style={{cursor: 'inherit'}}
        >
          <span className='flex-vertical-center' style={{width: '100%', justifyContent: 'space-between'}}>
            <TabCountLabel style={ACCORDIAN_HEADING_STYLES} label={`${startCase(resource)} Version History`} count={!isEmpty(versions) && versions.length} />
            <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
              {
                showCompareOption &&
                  <Button
                    startIcon={<CompareArrowsIcon fontSize='inherit' />}
                    variant='text'
                    size='small'
                    color='primary'
                    style={{marginRight: '15px', textTransform: 'none'}}
                    onClick={onCompareClick}
                  >
                    Compare
                  </Button>
              }

              <Tooltip arrow title={`All changes to a ${resource} are automatically saved to its ${startCase(resource)} Version History`}>
                <InfoIcon fontSize='small' color='action' />
              </Tooltip>
            </span>
          </span>
        </AccordionSummary>
        <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
          {
            isEmpty(sortedVersions) ?
              None() :
              map(sortedVersions, (version, index) => {
                const isRetired = version.retired
                return (
                  <React.Fragment key={index}>
                    <div className='col-md-12 flex-vertical-center' style={{padding: '0 3px'}}>
                      {
                        canSelect &&
                          <div className='col-md-1 no-side-padding'>
                            <Checkbox size='small' onChange={event => onSelectChange(event, version.version_url)} />
                          </div>
                      }
                      <div className={`${gridClass} no-side-padding flex-vertical-center`} style={{margin: '10px 0'}}>
                        <div className='col-md-11 no-side-padding flex-vertical-center'>
                          <div className={isRetired ? 'col-md-10 no-side-padding' : 'col-md-12 no-side-padding'}>
                            <div className='col-md-12 no-side-padding'>
                              {
                                Boolean(version.update_comment) &&
                                  <span>{version.update_comment}</span>
                              }
                            </div>
                            <div className='col-md-12 no-side-padding' style={{marginTop: '5px'}}>
                              <LastUpdatedOnLabel
                                by={version.version_created_by}
                                date={version.version_created_on}
                              />
                            </div>
                            {
                              version?.checksums &&
                                <div className='col-md-12 no-side-padding gray-italics-small' style={{marginTop: '-5px', marginBottom: '10px'}}>
                                  <Tooltip title="Checksum of versions's metadata, locales, direct associations and source versions." placement='left'>
                                    <div>
                                      <BetaLabel label='Checksum' />:
                                      <_Checksum checksum={version.checksums.all} />
                                      <span>
                                        <IconButton size='small' color='primary' onClick={() => setExpandChecksums(!expandChecksums)}>
                                          {expandChecksums ? <UpIcon fontSize='inherit' /> : <DownIcon fontSize='inherit' />}
                                        </IconButton>
                                      </span>
                                    </div>
                                  </Tooltip>
                                  {
                                    expandChecksums &&
                                      <Collapse in={expandChecksums} style={{marginTop: '-5px', background: 'rgba(0, 0, 0, 0.1)', padding: '5px 5px 3px', borderRadius: '2px'}}>
                                        <Checksum title="Checksum of versions's metadata." label='Metadata' checksum={version.checksums.meta} />
                                        <Checksum title="Checksum of versions's names." label='Names' checksum={version.checksums.names} />
                                        <Checksum title="Checksum of versions's descriptions." label='Descriptions' checksum={version.checksums.descriptions} />
                                        <Checksum title="Checksum of versions's associations." label='Associations' checksum={version.checksums.mappings} />
                                        <Checksum title="Checksum of versions's source versions." label='Source Versions' checksum={version.checksums.repo_versions} />
                                      </Collapse>
                                  }
                                </div>
                            }
                          </div>
                          {
                            isRetired &&
                              <div className='col-md-2 no-right-padding'>
                                <RetiredChip size='small' />
                              </div>
                          }
                        </div>
                        <div className='col-md-1 no-right-padding' style={{paddingLeft: '5px'}}>
                          <Tooltip arrow title='Version Link'>
                            <IconButton href={`#${version.version_url}`} color='primary' size='small'>
                              <SearchIcon fontSize='inherit' />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    {
                      version && (!isEmpty(version.source_versions) || !isEmpty(version.collection_versions)) &&
                        <div className='col-md-11 no-side-padding' style={{textAlign: 'center', marginTop: '-15px'}}>
                          <SourceChildVersionAssociationWithContainer
                            associatedWith={{
                              source: version.source_versions,
                              collection: version.collection_versions
                            }}
                            resource={resource}
                            style={canSelect ? {marginLeft: '40px'} : {}}
                          />
                        </div>
                    }
                    {
                      (index + 1) < versions.length &&
                        <Divider style={{width: '100%', display: 'inline-block'}} />
                    }
                  </React.Fragment>
                )
              })
          }
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  );
}

export default VersionList;
