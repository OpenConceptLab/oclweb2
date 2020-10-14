import moment from 'moment';
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
