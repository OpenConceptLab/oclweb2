import React from 'react';
import { DARKGRAY } from '../../common/constants';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import MappingButton from '../common/MappingButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import MappingIcon from './MappingIcon';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};


const MappingHomeHeader = ({
  mapping, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const isRetired = mapping.retired;

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 container' style={{paddingTop: '10px'}}>
        <MappingIcon url={currentURL} />
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...mapping} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={mapping.source} childURI={versionedObjectURL} />
            <span className='separator'>/</span>
            <MappingButton label={mapping.id} mapType={mapping.map_type} retired={isRetired} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>

                <VersionButton label={mapping.version} retired={isRetired} href={`#${currentURL}`} />
              </React.Fragment>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
            <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
              From:
            </div>
            <div className='col-sm-11 no-side-padding'>
              <FromConceptLabel {...mapping} />
            </div>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
            <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
              To:
            </div>
            <div className='col-sm-11 no-side-padding'>
              <ToConceptLabel {...mapping} />
            </div>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
            <span>
              <LastUpdatedOnLabel
                date={mapping.updated_at}
                by={mapping.updated_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            <span style={{marginLeft: '10px'}}>
              <LastUpdatedOnLabel
                label='Created'
                date={mapping.created_at}
                by={mapping.created_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            {
              mapping.external_id &&
              <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                <ExternalIdLabel externalId={mapping.external_id} iconSize='medium' />
              </span>
            }

          </div>

        </div>
      </div>
    </header>
  );
}

export default MappingHomeHeader;
