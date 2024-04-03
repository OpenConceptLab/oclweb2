import React from 'react';
import {
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';
import { ResourceTextButton } from '../common/OwnerLabel';
import { toParentURI, toOwnerURI } from '../../common/utils';
import { BLUE, GREEN, ORANGE } from '../../common/constants';

const ResourceTextBreadcrumbs = ({ resource, style, includeSelf }) => {
  return (
    <div className='col-xs-12 no-side-padding flex-vertical-center' style={style}>
      <ResourceTextButton href={`#${toOwnerURI(resource.url)}`} resource={resource?.owner_type?.toLowerCase()} id={resource.owner} color={ORANGE} />
      <span className='separator-small' style={{padding: '0'}}><SeparatorIcon /></span>
      <ResourceTextButton href={`#${toParentURI(resource.url) + (resource?.latest_source_version ? resource.latest_source_version + '/' : '')}`} resource='source' id={resource.source} color={GREEN} />
      {
        includeSelf &&
        <React.Fragment>
          <span className='separator-small' style={{padding: '0'}}><SeparatorIcon /></span>
          <ResourceTextButton href={`#${resource.url}`} resource='concept' id={resource.id} color={BLUE} />
          {
            (resource.uuid !== resource.versioned_object_id?.toString() || resource.is_latest_version) &&
            <React.Fragment>
              <span className='separator-small' style={{padding: '0'}}><SeparatorIcon /></span>
              <ResourceTextButton href={`#${resource.version_url}`} resource='version' id={resource.version} color={BLUE} />
            </React.Fragment>
          }
        </React.Fragment>
      }
    </div>

  )
}

export default ResourceTextBreadcrumbs;
