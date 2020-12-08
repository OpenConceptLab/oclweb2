import React from 'react';
import {
  Loyalty as LoyaltyIcon,
} from '@material-ui/icons';
import { Tooltip } from '@material-ui/core';
import { includes } from 'lodash';
import { toFullAPIURL, copyURL } from '../../common/utils';
import { GREEN } from '../../common/constants';
import OwnerButton from '../common/OwnerButton';
import CollectionButton from '../common/CollectionButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import PublicAccessChip from '../common/PublicAccessChip';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';

const CollectionHomeHeader = ({
  collection, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const isRetired = collection.isRetired;
  const onIconClick = () => copyURL(toFullAPIURL(currentURL))

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
            <HeaderAttribute
              label="Website"
              value={
                collection.website ?
                     <a href={collection.website} target="_blank" rel="noopener noreferrer"> {collection.website} </a> :
                     'None'
              }
              gridClass="col-md-12"
            />
          </div>
          <div className="col-md-7 no-side-padding">
            <HeaderAttribute label="Collection Type" value={collection.collection_type} gridClass="col-md-12" />
            <HeaderAttribute label="Default Locale" value={collection.default_locale} gridClass="col-md-12" />
            <HeaderAttribute label="Supported Locale" value={collection.supported_locales.join(', ')} gridClass="col-md-12" />
            <HeaderAttribute label="Custom Validation Schema" value={collection.custom_validation_schema} gridClass="col-md-12" />
          </div>
          <HeaderAttribute label="Custom Attributes" value={<CustomAttributesPopup attributes={collection.extras} />} gridClass="col-md-12" />
          <div className='col-md-12 no-side-padding'>
            <CollapsibleAttributes
              object={collection}
              urlAttrs={['canonical_url']}
              textAttrs={['publisher', 'purpose', 'copyright', 'preferred_source', 'custom_resources_linked_source']}
              dateAttrs={['revision_date']}
              jsonAttrs={['identifier', 'contact', 'jurisdiction']}
              booleanAttrs={['immutable']}
            />
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
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
