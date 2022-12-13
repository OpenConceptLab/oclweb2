import React from 'react';
import { Link } from 'react-router-dom'
import {
  Accordion, AccordionSummary, AccordionDetails, CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  Loyalty as LoyaltyIcon, InfoOutlined as InfoIcon,
  NewReleases as ReleaseIcon, Block as RetireIcon
} from '@mui/icons-material'
import { map, isEmpty, find, groupBy, orderBy, without, includes } from 'lodash';
import ResourceLabel from '../common/ResourceLabel';
import { DARKGRAY } from '../../common/constants';
import TabCountLabel from '../common/TabCountLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  width: '100%', padding: '0', overflowX: 'auto'
}

const None = () => (<div style={{padding: '5px 15px', fontWeight: '300'}}>None</div>);


const SourceChildCollections = ({ collectionVersions, isLoadingCollections, resourceType }) => {
  const count = isLoadingCollections ? null : collectionVersions.length
  const getProminentCollectionVersion = versions => {
    const orderedVersions = orderBy(versions, 'created_at', ['desc'])
    const releasedVersion = find(orderedVersions, {released: true, retired: false})
    if(releasedVersion)
      return releasedVersion
    const headVersion = find(orderedVersions, {version: 'HEAD'})
    if(headVersion)
      return headVersion

    return orderedVersions[0]
  }

  const [expand, setExpand] = React.useState([]);
  const toggleExpand = collectionURL => {
    if(includes(expand, collectionURL))
      setExpand(without(expand, collectionURL))
    else
      setExpand([...expand, collectionURL])
  }

  const ReleasedIndicator = (<Tooltip title='Released'><ReleaseIcon fontSize='small' color='primary' /></Tooltip>);
  const RetiredIndicator = (<Tooltip title='Retired'><RetireIcon fontSize='small' className='retired-red' /></Tooltip>);

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
            <TabCountLabel style={ACCORDIAN_HEADING_STYLES} label='Collection Membership' count={count} />
            <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
              <Tooltip title={`The Collection Membership section only lists collections under the same owner for which this specific ${resourceType} version is a member. Collection membership for other versions of this same ${resourceType} are not included here.`}>
                <InfoIcon fontSize='small' color='action' />
              </Tooltip>
            </span>
          </span>
        </AccordionSummary>
        <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
          {
            isLoadingCollections ?
            <div style={{textAlign: 'center', padding: '10px'}}>
              <CircularProgress />
            </div> : (
              isEmpty(collectionVersions) ?
              None() :
              map(groupBy(collectionVersions, 'short_code'), (collections, short_code) => {
                const prominentVersion = getProminentCollectionVersion(collections)
                const moreCount = collections.length - 1
                const isExpanded = includes(expand, prominentVersion.version_url)
                return (
                  <React.Fragment key={prominentVersion.version_url}>
                    <div className='col-md-12 no-side-padding' style={{borderBottom: '1px solid lightgray'}}>
                      <div className='col-md-12 flex-vertical-center' style={{padding: '0 10px'}}>
                        <Link to={prominentVersion.version_url}>
                          <div style={{padding: '10px', display: 'inline-flex'}}>
                            <ResourceLabel
                              noSeparator
                              id={short_code}
                              name={`${prominentVersion.name} / ${prominentVersion.version}`}
                              icon={<LoyaltyIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
                              colorClass="collection-bg"
                            />
                          </div>
                        </Link>
                        {prominentVersion.released && ReleasedIndicator}
                        {prominentVersion.retired && RetiredIndicator}
                        {
                          moreCount > 0 &&
                          <IconButton style={{marginLeft: '5px'}} size='small' color='primary' onClick={() => toggleExpand(prominentVersion.version_url)}>
                            <span style={{fontSize: '12px'}}>{`+${moreCount}`}</span>
                          </IconButton>
                        }
                      </div>
                      {
                        isExpanded &&
                        <div className='col-md-11' style={{marginLeft: '30px', marginBottom: '10px'}}>
                          {
                            map(without(collections, prominentVersion), collection => (
                              <React.Fragment key={collection.version_url}>
                                <Link to={collection.version_url}>
                                  <div style={{padding: '0px 15px', display: 'inline-flex'}}>
                                    <ResourceLabel
                                      noSeparator
                                      id={collection.short_code}
                                      name={`${collection.name} / ${collection.version}`}
                                      icon={<LoyaltyIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
                                      colorClass="collection-bg"
                                    />
                                  </div>
                                </Link>
                                {collection.released && ReleasedIndicator}
                                {collection.retired && RetiredIndicator}
                              </React.Fragment>
                            ))
                          }
                        </div>
                      }
                    </div>
                  </React.Fragment>
                )
              })
            )
          }
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  )
}

export default SourceChildCollections;
