import React from 'react';
import {
  Loyalty as LoyaltyIcon,
} from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { includes, keys, map, startCase, get } from 'lodash';
import { toFullAPIURL, copyURL, nonEmptyCount } from '../../common/utils';
import { GREEN } from '../../common/constants';
import OwnerButton from '../common/OwnerButton';
import CollectionButton from '../common/CollectionButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import LinkLabel from '../common/LinkLabel';
import PublicAccessChip from '../common/PublicAccessChip';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';

const HIDDEN_ATTRIBUTES = {
  canonical_url: 'url',
  publisher: 'text',
  purpose: 'text',
  copyright: 'text',
  preferred_source: 'text',
  custom_resources_linked_source: 'text',
  revision_date: 'date',
  identifier: 'json',
  contact: 'json',
  jurisdiction: 'json',
  immutable: 'boolean',
}
const CollectionHomeHeader = ({
  collection, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const isRetired = collection.isRetired;
  const onIconClick = () => copyURL(toFullAPIURL(currentURL))
  const hasManyHiddenAttributes = nonEmptyCount(collection, keys(HIDDEN_ATTRIBUTES)) >= 4;

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon collection'>
          <Tooltip title='Copy URL'>
            <LoyaltyIcon onClick={onIconClick} />
          </Tooltip>
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...collection} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <CollectionButton label={collection.short_code} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>
                <VersionButton
                  label={collection.version} retired={isRetired} href={`#${currentURL}`}
                  bgColor={GREEN}
                />
              </React.Fragment>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}} className={isRetired ? 'retired': ''}>
              {collection.full_name}
            </span>
            {
              includes(['view', 'edit'], collection.public_access.toLowerCase()) &&
              <PublicAccessChip publicAccess={collection.public_access} />
            }
          </div>

          <div className="col-md-5 no-side-padding">
            <HeaderAttribute label="Short Code" value={collection.short_code} gridClass="col-md-12" />
            <HeaderAttribute label="Name" value={collection.name} gridClass="col-md-12" />
            <HeaderAttribute label="Description" value={collection.description} gridClass="col-md-12" />
          </div>
          <div className="col-md-7 no-side-padding">
            <HeaderAttribute label="Collection Type" value={collection.collection_type} gridClass="col-md-12" />
            <HeaderAttribute label="Default Locale" value={collection.default_locale} gridClass="col-md-12" />
            <HeaderAttribute label="Supported Locale" value={collection.supported_locales.join(', ')} gridClass="col-md-12" />
            <HeaderAttribute label="Custom Validation Schema" value={collection.custom_validation_schema} gridClass="col-md-12" />
          </div>
          <HeaderAttribute label="Custom Attributes" value={<CustomAttributesPopup attributes={collection.extras} />} gridClass="col-md-12" />
          {
            hasManyHiddenAttributes ?
            <div className='col-md-12 no-side-padding'>
              <CollapsibleAttributes
                object={collection}
                urlAttrs={['canonical_url']}
                textAttrs={['publisher', 'purpose', 'copyright', 'preferred_source', 'custom_resources_linked_source']}
                dateAttrs={['revision_date']}
                jsonAttrs={['identifier', 'contact', 'jurisdiction']}
                booleanAttrs={['immutable']}
              />
            </div> :
            <React.Fragment>
              {
                map(HIDDEN_ATTRIBUTES, (type, attr) => (
                  <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(collection, attr)} gridClass="col-md-12" type={type} />
                ))
              }
            </React.Fragment>
          }
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
            {
              collection.website &&
              <span>
                <LinkLabel link={collection.website} iconSize='medium' noContainerClass />
              </span>
            }
            <span>
              <LastUpdatedOnLabel
                date={collection.updated_on}
                by={collection.updated_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            <span style={{marginLeft: '10px'}}>
              <LastUpdatedOnLabel
                label='Created'
                date={collection.created_on}
                by={collection.created_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            {
              collection.external_id &&
              <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                <ExternalIdLabel externalId={collection.external_id} iconSize='medium' />
              </span>
            }
          </div>
        </div>
      </div>
    </header>
  )
}

export default CollectionHomeHeader;
