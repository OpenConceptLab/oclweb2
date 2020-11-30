import React from 'react';
import {
  Loyalty as LoyaltyIcon,
  Public as PublicIcon,
} from '@material-ui/icons';
import { Tooltip, Chip } from '@material-ui/core';
import { includes } from 'lodash';
import { toFullAPIURL, copyURL } from '../../common/utils';
import { GREEN } from '../../common/constants';
import OwnerButton from '../common/OwnerButton';
import CollectionButton from '../common/CollectionButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';

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
              <span style={{marginTop: '-5px'}}>
                <Chip label='Public' size='small' icon=<PublicIcon fontSize='inherit' /> />
              </span>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <span className='italic' style={{marginRight: '3px'}}>
              Collection Type:
            </span>
            <span>
              {collection.collection_type}
            </span>
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
