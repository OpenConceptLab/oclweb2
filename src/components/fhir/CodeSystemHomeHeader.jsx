import React from 'react';
import {
  List as ListIcon,
} from '@material-ui/icons';
import { isEmpty, keys, map, startCase, get } from 'lodash';
import { nonEmptyCount } from '../../common/utils';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import LinkLabel from '../common/LinkLabel';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';
import HeaderLogo from '../common/HeaderLogo';
import RetiredChip from '../common/RetiredChip';

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

const CodeSystemHomeHeader = ({source, url, parentURL}) => {
  const hasManyHiddenAttributes = nonEmptyCount(source, keys(HIDDEN_ATTRIBUTES)) >= 1;
  const status = get(source, 'status', '').toLowerCase()
  const isRetired = status === 'retired';
  const shortCode = source.id
  const lastUpdated = get(source, 'meta.lastUpdated')

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <HeaderLogo
            logoURL={source.logo_url}
            defaultIcon={<ListIcon className='default-svg' />}
          />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...source} href={parentURL} />
            <span className='separator'>/</span>
            <SourceButton label={shortCode} href={url} />
            {
              isRetired &&
              <span style={{marginLeft: '10px'}}>
                <RetiredChip size='small' />
              </span>
            }
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

export default CodeSystemHomeHeader;
