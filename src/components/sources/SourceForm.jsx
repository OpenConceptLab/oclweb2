import React from 'react';
import { orderBy, map } from 'lodash';
import { SOURCE_TYPES } from '../../common/constants';
import ConceptContainerForm from '../common/ConceptContainerForm';

const HIERARCHY_MEANING = ['grouped-by', 'is-a', 'part-of', 'classified-with']
const AUTO_ID_OPTIONS = ['uuid', 'sequential']
const AUTO_ID_FIELDS = ['autoid_concept_mnemonic', 'autoid_mapping_mnemonic', 'autoid_concept_external_id', 'autoid_mapping_external_id']
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
  extraFields: [
    'publisher', 'purpose', 'copyright', 'content_type', 'identifier', 'contact',
    'jurisdiction', 'collection_reference', 'meta',
  ],
  extraBooleanFields: ['experimental', 'case_sensitive', 'compositional', 'version_needed'],
  extraSelectFields: [
    {id: 'hierarchy_meaning', options: HIERARCHY_MEANING},
    {id: 'autoid_concept_mnemonic', options: AUTO_ID_OPTIONS, label: 'Auto Concept ID'},
    {id: 'autoid_mapping_mnemonic', options: AUTO_ID_OPTIONS, label: 'Auto Mapping ID'},
    {id: 'autoid_concept_external_id', options: AUTO_ID_OPTIONS},
    {id: 'autoid_mapping_external_id', options: AUTO_ID_OPTIONS},
  ],
  extraNumberFields: [
    'autoid_concept_mnemonic_start_from', 'autoid_concept_external_id_start_from',
    'autoid_mapping_mnemonic_start_from', 'autoid_mapping_external_id_start_from',
  ],
  extraURIFields: ['hierarchy_root_url'],
}

const SourceForm = props => (
  <ConceptContainerForm {...props} {...CONFIGS} resource={props.source} autoidFields={AUTO_ID_FIELDS} />
);

export default SourceForm;

