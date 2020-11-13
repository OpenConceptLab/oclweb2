/*eslint no-process-env: 0*/
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import { filter, difference } from 'lodash';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

export const isAtGlobalSearch = () => {
  return window.location.hash.includes('#/search');
}

export const formatDate = date => {
  return moment(date).format(DATE_FORMAT);
}

export const formatDateTime = date => {
  return moment(date).format(DATETIME_FORMAT);
}

export const getIndirectMappings = (mappings, concept) => {
  return filter(mappings, {from_concept_code: concept});
}

export const getDirectMappings = (mappings, concept) => {
  return filter(mappings, {to_concept_code: concept});
}

export const getDirectExternalMappings = (mappings, concept) => {
  return filter(mappings, mapping => Boolean(mapping.from_concept_code === concept && mapping.external_id));
}

export const getLinkedQuestions = (mappings, concept) => {
  return filter(mappings, {to_concept_code: concept, map_type: 'Q-AND-A'});
}

export const getLinkedAnswers = (mappings, concept) => {
  return filter(mappings, {from_concept_code: concept, map_type: 'Q-AND-A'});
}

export const getSetParents = (mappings, concept) => {
  return filter(mappings, {to_concept_code: concept, map_type: 'CONCEPT-SET'});
}

export const getSetMembers = (mappings, concept) => {
  return filter(mappings, {from_concept_code: concept, map_type: 'CONCEPT-SET'});
}

export const getMappingsDistributionByMapType = (mappings, concept) => {
  const linkedQuestions = getLinkedQuestions(mappings, concept);
  const linkedAnswers = getLinkedAnswers(mappings, concept);
  const setParents = getSetParents(mappings, concept);
  const setMembers = getSetMembers(mappings, concept);
  const directExternalMappings = getDirectExternalMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers]),
    concept
  );
  const directInternalMappings = getDirectMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers, ...directExternalMappings]),
    concept
  );
  const indirectMappings = getIndirectMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers, ...directExternalMappings, ...directInternalMappings]),
    concept
  );

  return {
    'Linked Question': linkedQuestions,
    'Linked Answers': linkedAnswers,
    'Set Parent': setParents,
    'Set Members': setMembers,
    'Direct External Mapping': directExternalMappings,
    'Direct Internal Mapping': directInternalMappings,
    'Inverse Mapping': indirectMappings,
  }
}

export const toFullURL = uri => {
  return window.location.origin + '/#' + uri;
}

export const toFullAPIURL = uri => {
  /*eslint no-undef: 0*/
  const APIURL = window.API_URL || process.env.API_URL;
  return APIURL + uri;
}

export const copyURL = url => {
  if(url) {
    navigator.clipboard.writeText(url);
    alertifyjs.success('Copied URL to clipboard!')
  }
}
