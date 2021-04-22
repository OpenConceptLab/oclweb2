import React from 'react';
import { orderBy, map } from 'lodash';
import { SOURCE_TYPES } from '../../common/constants';
import ConceptContainerForm from '../common/ConceptContainerForm';

const HIERARCHY_MEANING = ['grouped-by', 'is-a', 'part-of', 'classified-with']

const CONFIGS = {
  resourceType: 'source',
  defaultIdText: 'SourceCode',
  urlPath: 'sources',
  types: orderBy(map(SOURCE_TYPES, t => ({id: t, name: t})), 'name'),
  placeholders: {
    id: "e.g. ICD-10",
    name: "e.g. ICD 10",
    full_name: "e.g. International Classification for Diseases v10",
    website: "e.g. http://apps.who.int/classifications/icd10/",
    external_id: "e.g. UUID from external system",
    canonical_url: "e.g. http://who.int/ICPC-2",
  },
  extraFields: ['publisher', 'purpose', 'copyright', 'content_type', 'identifier', 'contact', 'jurisdiction', 'collection_reference', 'meta'],
  extraBooleanFields: ['experimental', 'case_sensitive', 'compositional', 'version_needed'],
  extraSelectFields: [{id: 'hierarchy_meaning', options: HIERARCHY_MEANING}],
  extraURIFields: ['hierarchy_root_url'],
}

const SourceForm = props => (
  <ConceptContainerForm {...props} {...CONFIGS} resource={props.source} />
);

export default SourceForm;

