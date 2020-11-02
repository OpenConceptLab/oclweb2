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

