import React from 'react';
import {
  List as ListIcon,
  Public as PublicIcon,
} from '@material-ui/icons';
import { Tooltip, Chip } from '@material-ui/core';
import { includes } from 'lodash';
import { toFullAPIURL, copyURL } from '../../common/utils';
import { GREEN } from '../../common/constants';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';

const SourceHomeHeader = ({
  source, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const isRetired = source.isRetired;
  const onIconClick = () => copyURL(toFullAPIURL(currentURL))

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon source'>
          <Tooltip title='Copy URL'>
            <ListIcon onClick={onIconClick} />
          </Tooltip>
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...source} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={source.short_code} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>
                <VersionButton
                  label={source.version} retired={isRetired} href={`#${currentURL}`}
                  bgColor={GREEN}
                />
              </React.Fragment>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}} className={isRetired ? 'retired': ''}>
              {source.full_name}
            </span>
            {
              includes(['view', 'edit'], source.public_access.toLowerCase()) &&
              <span style={{marginTop: '-5px'}}>
                <Chip label='Public' size='small' icon=<PublicIcon fontSize='inherit' /> />
              </span>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <span className='italic' style={{marginRight: '3px'}}>
              Source Type:
            </span>
            <span>
              {source.source_type}
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
            <span>
              <LastUpdatedOnLabel
                date={source.updated_on}
                by={source.updated_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            <span style={{marginLeft: '10px'}}>
              <LastUpdatedOnLabel
                label='Created'
                date={source.created_on}
                by={source.created_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            {
              source.external_id &&
              <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                <ExternalIdLabel externalId={source.external_id} iconSize='medium' />
              </span>
            }
          </div>
        </div>
      </div>
    </header>
  )
}

export default SourceHomeHeader;
