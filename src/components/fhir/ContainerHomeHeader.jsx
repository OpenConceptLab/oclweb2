import React from 'react';
import { ButtonGroup, Tooltip, Button } from '@material-ui/core'
import {
  FileCopy as CopyIcon,
  List as ListIcon,
  Loyalty as LoyaltyIcon,
  Link as LinkIcon
} from '@material-ui/icons';
import { isEmpty, keys, map, startCase, get } from 'lodash';
import { nonEmptyCount, copyURL, toFullAPIURL } from '../../common/utils';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import CollectionButton from '../common/CollectionButton';
import ConceptMapButton from '../common/ConceptMapButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import LinkLabel from '../common/LinkLabel';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';
import HeaderLogo from '../common/HeaderLogo';
import RetiredChip from '../common/RetiredChip';
import DownloadButton from '../common/DownloadButton';

const HIDDEN_ATTRIBUTES = {
  canonical_url: 'url',
  publisher: 'text',
  purpose: 'text',
  copyright: 'text',
  content_type: 'text',
  revision_date: 'date',
  identifier: 'json',
  contact: 'json',
  jurisdiction: 'json',
  release_date: 'date',
}

const ContainerHomeHeader = ({source, url, parentURL, resource, serverURL}) => {
  const hasManyHiddenAttributes = nonEmptyCount(source, keys(HIDDEN_ATTRIBUTES)) >= 1;
  const status = get(source, 'status', '').toLowerCase()
  const isRetired = status === 'retired';
  const shortCode = source.id
  const lastUpdated = get(source, 'meta.lastUpdated')
  const isCodeSystem = resource === 'CodeSystem'
  const isValueSet = resource === 'ValueSet'
  const isConceptMap = resource === 'ConceptMap'
  const getIcon = () => {
    if(isCodeSystem)
      return <ListIcon className='default-svg' />;
    if(isValueSet)
      return <LoyaltyIcon className='default-svg' />;
    if(isConceptMap)
      return <LinkIcon className='default-svg' />;
  }
  const getResourceButton = () => {
    if(isCodeSystem)
      return <SourceButton label={shortCode} href={url} />;
    if(isValueSet)
      return <CollectionButton label={shortCode} href={url} />;
    if(isConceptMap)
      return <ConceptMapButton label={shortCode} href={url} />;
  }

  const onCopyClick = () => copyURL(toFullAPIURL(serverURL))

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <HeaderLogo
            logoURL={source.logo_url}
            defaultIcon={getIcon()}
          />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...source} href={parentURL} />
            <span className='separator'>/</span>
            { getResourceButton() }
            {
              isRetired &&
              <span style={{marginLeft: '10px'}}>
                <RetiredChip size='small' />
              </span>
            }
            <span style={{marginLeft: '15px'}}>
              <ButtonGroup variant='text' size='large'>
                <Tooltip arrow title="Copy URL">
                  <Button onClick={onCopyClick}>
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                <DownloadButton resource={source} formats={['json']} tooltip='Download' />
              </ButtonGroup>
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}}>
              {source.full_name}
            </span>
          </div>
          {
            source.description &&
            <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
              {source.description}
            </div>
          }
          <HeaderAttribute label="Source Type" value={source.source_type} gridClass="col-md-12" />
          <HeaderAttribute label="Custom Attributes" value={!isEmpty(source.extras) && <CustomAttributesPopup attributes={source.extras} />} gridClass="col-md-12" />
          {
            hasManyHiddenAttributes ?
            <div className='col-md-12 no-side-padding'>
              <CollapsibleAttributes
                object={source}
                urlAttrs={['canonical_url']}
                textAttrs={['publisher', 'purpose', 'copyright', 'content_type']}
                dateAttrs={['revision_date', 'release_date']}
                jsonAttrs={['identifier', 'contact', 'jurisdiction']}
              />
            </div> :
            <React.Fragment>
              {
                map(HIDDEN_ATTRIBUTES, (type, attr) => (
                  <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(source, attr)} gridClass="col-md-12" type={type} />
                ))
              }
            </React.Fragment>
          }
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
            {
              source.website &&
              <span style={{marginRight: '10px'}}>
                <LinkLabel link={source.website} iconSize='medium' noContainerClass />
              </span>
            }
            <span>
              <LastUpdatedOnLabel
                date={lastUpdated}
                by={source.updated_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ContainerHomeHeader;
