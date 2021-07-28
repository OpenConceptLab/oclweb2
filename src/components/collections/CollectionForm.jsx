import React from 'react';
import { orderBy, map } from 'lodash';
import { COLLECTION_TYPES } from '../../common/constants';
import ConceptContainerForm from '../common/ConceptContainerForm';

const CONFIGS = {
  resourceType: 'collection',
  defaultIdText: 'CollectionCode',
  urlPath: 'collections',
  types: orderBy(map(COLLECTION_TYPES, t => ({id: t, name: t})), 'name'),
  placeholders: {
    id: "e.g. c80-practice-codes",
    name: "",
    full_name: "e.g. HL7 FHIR Practice Setting Code Value Set",
    website: "e.g. https://www.hl7.org/fhir/valueset-c80-practice-codes.html",
    external_id: "e.g. UUID from external system",
    canonical_url: "e.g. http://who.int/ICPC-2",
  },
  extraFields: ['publisher', 'purpose', 'copyright', 'identifier', 'contact', 'jurisdiction', 'meta'],
  extraBooleanFields: ['experimental', 'immutable', 'autoexpand_head'],
  extraDateTimeFields: ['locked_date']
}

const CollectionForm = props => (
  <ConceptContainerForm {...props} {...CONFIGS} resource={props.collection} />
);

export default CollectionForm;

