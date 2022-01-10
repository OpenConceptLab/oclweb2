import React from 'react';
import { get } from 'lodash';
import HomeMappings from './HomeMappings';
import ConceptCollections from './ConceptCollections';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';
import HomeLocales from './HomeLocales';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const ConceptHomeDetails = ({ concept, isLoadingMappings, isLoadingCollections, source, childConcepts, parentConcepts, isLoadingChildren, isLoadingParents }) => {
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  return (
    <div className='row' style={{width: '100%', margin: 0}}>
      <div className='col-md-6 no-left-padding'>
        <HomeLocales
          concept={concept}
          locales={names}
          source={source}
          label='Names & Synonyms'
        />
        <HomeLocales
          concept={concept}
          locales={descriptions}
          source={source}
          label='Descriptions'
          isDescription
        />
        <CustomAttributesAccordian
          attributes={concept.extras || {}}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
      <div className='col-md-6 no-side-padding'>
        <HomeMappings concept={concept} isLoadingMappings={isLoadingMappings} childConcepts={childConcepts} parentConcepts={parentConcepts} isLoadingChildren={isLoadingChildren} isLoadingParents={isLoadingParents} source={source} />
        <ConceptCollections concept={concept} isLoadingCollections={isLoadingCollections} />
      </div>
    </div>
  );
}

export default ConceptHomeDetails;
