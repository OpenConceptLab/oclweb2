import React from 'react';
import { get } from 'lodash';
import HomeMappings from './HomeMappings';
import ConceptCollections from '../common/SourceChildCollections';
import CustomAttributesAccordion from '../common/CustomAttributesAccordion';
import ResourceReferences from '../common/ResourceReferences';
import HomeLocales from './HomeLocales';
import VersionList from '../common/VersionList';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  overflowX: 'auto', width: '100%', padding: '0'
}

const ConceptHomeDetails = ({ concept, isLoadingMappings, isLoadingCollections, source, singleColumn, versions, scoped, sourceVersion, parent, onIncludeRetiredAssociationsToggle, onCreateNewMapping, onRemoveMapping, onReactivateMapping, mappedSources, onUpdateMappingsSorting, onAssignSortWeight, onClearSortWeight, sourceVersionSummary }) => {
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  let classes = 'col-sm-12 padding-5';
  if(!singleColumn)
    classes += ' col-md-6'
  return (
    <div className='row' style={{width: '100%', margin: 0}}>
      <div className={classes}>
        <HomeLocales
          concept={concept}
          locales={names}
          source={source}
          label='Names & Synonyms'
          searchable
        />
        <HomeLocales
          concept={concept}
          locales={descriptions}
          source={source}
          label='Descriptions'
          isDescription
        />
        <CustomAttributesAccordion
          attributes={concept.extras || {}}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
      <div className={classes} style={{paddingTop: '10px'}}>
        <HomeMappings
          concept={concept}
          isLoadingMappings={isLoadingMappings}
          source={source}
          mappedSources={mappedSources}
          sourceVersion={sourceVersion}
          parent={parent}
          onIncludeRetiredToggle={onIncludeRetiredAssociationsToggle}
          onCreateNewMapping={onCreateNewMapping}
          onUpdateMappingsSorting={onUpdateMappingsSorting}
          onRemoveMapping={onRemoveMapping}
          onReactivateMapping={onReactivateMapping}
          onAssignSortWeight={onAssignSortWeight}
          onClearSortWeight={onClearSortWeight}
          sourceVersionSummary={sourceVersionSummary}
        />
        {
          scoped === 'collection' ?
            <ResourceReferences
              resource='concept'
              references={concept.references}
              headingStyles={ACCORDIAN_HEADING_STYLES}
              detailStyles={ACCORDIAN_DETAILS_STYLES}
            /> :
          <React.Fragment>
            <ConceptCollections collectionVersions={get(concept, 'collections') || []} isLoadingCollections={isLoadingCollections} resourceType='concept' />
            <VersionList versions={versions} resource='concept' />
          </React.Fragment>
        }
      </div>
    </div>
  );
}

export default ConceptHomeDetails;
