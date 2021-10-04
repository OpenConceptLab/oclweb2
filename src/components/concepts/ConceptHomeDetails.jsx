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

const ConceptHomeDetails = ({ concept, isLoadingMappings, isLoadingCollections, source }) => {
  const names = get(concept, 'names', [])
  const descriptions = get(concept, 'descriptions', [])
  return (
    <React.Fragment>
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
      <div className='col-md-6 no-right-padding'>
        <HomeMappings concept={concept} isLoadingMappings={isLoadingMappings} />
        <ConceptCollections concept={concept} isLoadingCollections={isLoadingCollections} />
      </div>
    </React.Fragment>
  );
}

export default ConceptHomeDetails;
