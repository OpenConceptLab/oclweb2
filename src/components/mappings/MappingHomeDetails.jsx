import React from 'react';
import MappingCollections from '../common/SourceChildCollections';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';
import VersionList from '../common/VersionList';
import ResourceReferences from '../common/ResourceReferences';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  overflowX: 'auto', width: '100%', padding: '0'
}

const MappingHomeDetails = ({ mapping, singleColumn, versions, isLoadingCollections, scoped }) => {
  let classes = 'col-sm-12 padding-5';
  if(!singleColumn)
    classes += ' col-md-6'
  return (
    <div className='row' style={{width: '100%', margin: 0}}>
      <div className={classes}>
        <CustomAttributesAccordian
          attributes={mapping.extras || {}}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
        {
          scoped !== 'collection' &&
            <MappingCollections instance={mapping} isLoadingCollections={isLoadingCollections} />
        }
      </div>
      {
        scoped === 'collection' ?
          <ResourceReferences
            resource='mapping'
            references={mapping.references}
            headingStyles={ACCORDIAN_HEADING_STYLES}
            detailStyles={ACCORDIAN_DETAILS_STYLES}
          /> :
        <div className={classes} style={{paddingTop: '10px'}}>
          <VersionList versions={versions} resource='mapping' />
        </div>
      }
    </div>
  );
}

export default MappingHomeDetails;
