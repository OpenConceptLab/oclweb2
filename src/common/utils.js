/*eslint no-process-env: 0*/
import moment from 'moment';
import { filter } from 'lodash';
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

export const toFullURL = uri => {
  return window.location.origin + '/#' + uri;
}
export const toFullAPIURL = uri => {
  /*eslint no-undef: 0*/
  const APIURL = window.API_URL || process.env.API_URL;
  return APIURL + uri;
}


