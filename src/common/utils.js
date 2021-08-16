/*eslint no-process-env: 0*/
import React from 'react';
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import {
  filter, difference, compact, find, reject, intersectionBy, size, keys, omitBy, isEmpty,
  get, includes, map, isArray, values, pick, sortBy, zipObject, orderBy, isObject, merge,
  uniqBy, cloneDeep
} from 'lodash';
import {
  DATE_FORMAT, DATETIME_FORMAT,
  OCL_SERVERS_GROUP, OCL_FHIR_SERVERS_GROUP, HAPI_FHIR_SERVERS_GROUP,
} from './constants';
import APIService from '../services/APIService';
import { SERVER_CONFIGS } from './serverConfigs';

export const currentPath = () => window.location.hash.split('?')[0];

export const isAtGlobalSearch = () => window.location.hash.includes('#/search') || isAtRoot();

export const isAtRoot = () => currentPath() === '#/';

export const formatDate = date => moment(date).format(DATE_FORMAT);

export const formatDateTime = date => moment(date).format(DATETIME_FORMAT);

export const formatWebsiteLink = (value, style, text) => {
  if(value && value.trim()) {
    let href = value.trim();
    if(!href.startsWith('http://') && !href.startsWith('https://'))
      href = 'https://' + href;

    return (
      <a
        target='_blank'
        rel="noopener noreferrer"
        href={href}
        className="ellipsis-text"
        style={merge({maxWidth: '100px'}, (style || {}))}>
        {text || value.trim()}
      </a>
    );
  }
  return '';
}

export const getIndirectMappings = (mappings, concept_url) => filter(mappings, {to_concept_url: concept_url});

export const getDirectMappings = (mappings, concept_url) => filter(mappings, {from_concept_url: concept_url});

export const getDirectExternalMappings = (mappings, concept_url) => filter(mappings, mapping => Boolean(mapping.from_concept_url === concept_url && mapping.external_id));

export const getLinkedQuestions = (mappings, concept_url) => filter(mappings, {to_concept_url: concept_url, map_type: 'Q-AND-A'});

export const getLinkedAnswers = (mappings, concept_url) => filter(mappings, {from_concept_url: concept_url, map_type: 'Q-AND-A'});

export const getSetParents = (mappings, concept_url) => filter(mappings, {to_concept_url: concept_url, map_type: 'CONCEPT-SET'});

export const getSetMembers = (mappings, concept_url) => filter(mappings, {from_concept_url: concept_url, map_type: 'CONCEPT-SET'});

export const getMappingsDistributionByMapType = (mappings, concept_url) => {
  const linkedQuestions = getLinkedQuestions(mappings, concept_url);
  const linkedAnswers = getLinkedAnswers(mappings, concept_url);
  const setParents = getSetParents(mappings, concept_url);
  const setMembers = getSetMembers(mappings, concept_url);
  const directExternalMappings = getDirectExternalMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers]),
    concept_url
  );
  const directInternalMappings = getDirectMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers, ...directExternalMappings]),
    concept_url
  );
  const indirectMappings = getIndirectMappings(
    difference(mappings, [...linkedAnswers, ...linkedQuestions, ...setParents, ...setMembers, ...directExternalMappings, ...directInternalMappings]),
    concept_url
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

export const toFullURL = uri => window.location.origin + '/#' + uri;

export const toFullAPIURL = uri => {
  /*eslint no-undef: 0*/
  const config = getAppliedServerConfig()
  const APIURL = config.url;
  return APIURL + uri;
}

export const copyURL = url => {
  copyToClipboard(url, 'Copied URL to clipboard!');
}

export const copyToClipboard = (copyText, message) => {
  if(copyText)
    navigator.clipboard.writeText(copyText);

  if(message)
    alertifyjs.success(message);
}

export const toParentURI = uri => uri.split('/').splice(0, 5).join('/');

export const toOwnerURI = uri => uri.split('/').splice(0, 3).join('/');

export const headFirst = versions => compact([find(versions, {version: 'HEAD'}), ...reject(versions, {version: 'HEAD'})]);

export const currentUserToken = () => localStorage.token;

export const isLoggedIn = () => Boolean(currentUserToken());

export const getCurrentUser = () => {
  const data = localStorage.user;
  if(data)
    return JSON.parse(data);

  return null;
};

export const getCurrentUserOrgs = () => get(getCurrentUser(), 'subscribed_orgs');

export const getCurrentUserUsername = () => get(getCurrentUser(), 'username');

export const nonEmptyCount = (object, attributes) => size(intersectionBy(keys(omitBy(object, val => (isEmpty(val) || includes(['none', 'None'], val)))), attributes));

export const isCurrentUserMemberOf = orgId => Boolean(orgId && includes(map(getCurrentUserOrgs(), 'id'), orgId));

export const defaultCreatePin = (resourceType, resourceId, service, callback) => {
  if(service) {
    service.post({resource_type: resourceType, resource_id: resourceId}).then(response => {
      if(get(response, 'error')) {
        let error;
        if(isArray(response.error) && !isEmpty(compact(response.error)))
          error = compact(response.error)[0];
        else
          error = get(values(response.error), '0') || 'Something bad happened.';
        alertifyjs.error(error);
      } else if(callback && get(response, 'status') === 201)
        callback(response.data);
    });
  }
}

export const defaultDeletePin = (service, callback) => {
  if(service) {
    service.delete().then(response => {
      if(callback && get(response, 'status') === 204)
        callback();
    });
  }
}

export const isAdminUser = () => {
  const currentUser = getCurrentUser();
  return get(currentUser, 'is_staff') || get(currentUser, 'is_superuser');
}

export const toObjectArray = obj => isEmpty(obj) ? [] : map(keys(obj), k => pick(obj, k));

export const sortObjectBy = (obj, comparator) => {
  const _keys = sortBy(keys(obj), key => comparator ? comparator(obj[key], key) : key);
  return zipObject(_keys, map(_keys, key => obj[key]));
}

export const arrayToObject = arr => {
  if(isEmpty(arr))
    return {};

  return arr.reduce((prev, curr) => {
    if(curr.key)
      prev[curr.key] = curr.value;
    return prev;
  }, {});
}

export const currentUserHasAccess = () => {
  if(!isLoggedIn())
    return false;
  if(isAdminUser())
    return true;

  const url = window.location.hash.replace('#/', '');
  if(!url)
    return false;

  const url_parts = compact(url.split('/'));

  const ownerType = url_parts[0];
  const owner = url_parts[1];
  if(!owner || !ownerType)
    return false;

  const currentUser = getCurrentUser();
  if(ownerType === 'users')
    return currentUser.username === owner;
  if(ownerType === 'orgs')
    return isSubscribedTo(owner);

  return false;
}

export const isSubscribedTo = org => Boolean(org && includes(map(get(getCurrentUser(), 'subscribed_orgs'), 'id'), org));

export const getCurrentURL = () => window.location.href.replace(new RegExp('/$'), '');

const handleLookupValuesResponse = (data, callback, attr) => {
  const _attr = attr || 'id';
  callback(orderBy(uniqBy(map(data, cc => ({id: get(cc, _attr), name: get(cc, _attr)})), 'name')), 'name');
}

export const fetchLocales = callback => {
  APIService.orgs('OCL').sources('Locales').concepts().get(null, null, {limit: 1000}).then(response => {
    callback(orderBy(map(reject(response.data, {locale: null}), l => ({id: l.locale, name: `${l.display_name} [${l.locale}]`})), 'name'));});
}

export const fetchConceptClasses = callback => {
  APIService.orgs('OCL').sources('Classes').concepts()
    .get(null, null, {limit: 1000, brief: true})
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchMapTypes = callback => {
  APIService.orgs('OCL').sources('MapTypes').concepts()
    .get(null, null, {limit: 1000, brief: true})
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchDatatypes = callback => {
  APIService.orgs('OCL').sources('Datatypes').concepts()
    .get(null, null, {limit: 1000, brief: true})
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchNameTypes = callback => {
  APIService.orgs('OCL').sources('NameTypes').concepts()
    .get(null, null, {limit: 1000, brief: true})
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const fetchDescriptionTypes = callback => {
  APIService.orgs('OCL').sources('DescriptionTypes').concepts()
    .get(null, null, {limit: 1000, brief: true})
    .then(response => handleLookupValuesResponse(response.data, callback));
}

export const downloadObject = (obj, format, filename) => {
  const data = new Blob([obj], {type: format});
  downloadFromURL(window.URL.createObjectURL(data), filename);
}

export const downloadFromURL = (url, filename) => {
  const tempLink = document.createElement('a');
  tempLink.href = url;
  tempLink.setAttribute('download', filename);
  tempLink.click();
}

export const arrayToCSV = objArray => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = `${Object.keys(array[0]).map(value => `"${value}"`).join(",")}` + '\r\n';

  return array.reduce((str, next) => {
    str += `${Object.values(next).map(value => isObject(value) ? `"${JSON.stringify(value)}"` : `"${value}"`).join(",")}` + '\r\n';
    return str;
  }, str);
}

export const refreshCurrentUserCache = callback => {
  APIService.user().get(null, null, {includeSubscribedOrgs: true, includeAuthGroups: true}).then(response => {
    if(response.status === 200) {
      localStorage.setItem('user', JSON.stringify(response.data));
      if(callback) callback(response);
    }
  });
}

export const replaceCurrentUserCacheWith = data => localStorage.setItem('user', JSON.stringify(data));

export const formatByteSize = bytes => {
  if(bytes < 1024) return bytes + " bytes";
  else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KB";
  else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MB";
  else return(bytes / 1073741824).toFixed(3) + " GB";
};


export const memorySizeOf = (obj, format=true) => {
  var bytes = 0;

  const sizeOf = obj => {
    if(obj !== null && obj !== undefined) {
      switch(typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if(objClass === 'Object' || objClass === 'Array') {
            for(var key in obj) {
              if(!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  };


  const byteSize = sizeOf(obj);

  if(format)
    return formatByteSize(byteSize);

  return byteSize;
};

export const getCurrentUserCollections = callback => {
  const username = getCurrentUserUsername();
  if(username) {
    APIService.users(username)
              .collections()
              .get(null, null, {limit: 1000})
              .then(response => isArray(response.data) ? callback(response.data) : false);
    APIService.users(username)
              .orgs()
              .collections()
              .get(null, null, {limit: 1000})
              .then(response => isArray(response.data) ? callback(response.data) : false);
  }
}

export const isValidPassword = (password, strength, minStrength = 3) => {
  return Boolean(
    password &&
    strength >= minStrength &&
    password.length >= 8 &&
    password.match(new RegExp(/(?=.*[0-9])(?=.*[a-zA-Z])(?=\S+$)./g))
  );
}

export const getUserInitials = user => {
  user = user || getCurrentUser();
  if(!user)
    return '';

  let result = '';
  const first_name = get(user, 'first_name', '').trim();
  const last_name = get(user, 'last_name', '').trim();
  const username = user.username;
  const hasValidFirstName = first_name && first_name !== '-';
  const hasValidLastName = last_name && last_name !== '-';
  if(!hasValidFirstName && !hasValidLastName && username)
    result = username.slice(0, 2);
  if(hasValidFirstName)
    result = first_name[0];
  if(hasValidLastName)
    result += last_name[0];
  if(result.length == 1 && hasValidFirstName)
    result += first_name[1];

  return result.toUpperCase();
}

export const jsonifySafe = data => {
  if(!data)
    return data;

  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}

export const getSelectedServerConfig = () => {
  const serverConfig = localStorage.getItem('server');
  if(serverConfig)
    return JSON.parse(serverConfig);
}

export const getAppliedServerConfig = () => {
  const selectedConfig = getSelectedServerConfig();

  if(selectedConfig)
    return selectedConfig;

  const APIURL = window.API_URL || process.env.API_URL;
  return find(SERVER_CONFIGS, {url: APIURL});
}

export const isServerSwitched = () => {
  const selectedConfig = getSelectedServerConfig();
  return selectedConfig && selectedConfig.url !== (window.API_URL || process.env.API_URL);
};

export const getDefaultServerConfig = () => {
  const APIURL = window.API_URL || process.env.API_URL;
  return find(SERVER_CONFIGS, {url: APIURL});
}

export const canSwitchServer = () => {
  const user = getCurrentUser();

  return Boolean(
    getSelectedServerConfig() ||
    get(user, 'is_superuser') ||
    !isEmpty(get(user, 'auth_groups'))
  );
}

export const isFHIRServer = () => get(getAppliedServerConfig(), 'type') === 'fhir';

export const isConcept = uri => Boolean(uri.match('/concepts/'));
export const isMapping = uri => Boolean(uri.match('/mappings/'));


// https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
export const humanFileSize = (bytes, si=false, dp=1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
              ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
              : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export const getServerConfigsForCurrentUser = () => {
  if(isAdminUser())
    return SERVER_CONFIGS;

  const defaultConfig = getDefaultServerConfig();
  const appliedConfig = getAppliedServerConfig();

  let eligible = [];
  if(isLoggedIn()) {
    const { auth_groups } = getCurrentUser();
    if(includes(auth_groups, OCL_SERVERS_GROUP))
      eligible = [...eligible, ...filter(SERVER_CONFIGS, {type: 'ocl'})];
    if(includes(auth_groups, OCL_FHIR_SERVERS_GROUP))
      eligible = [...eligible, ...filter(SERVER_CONFIGS, {type: 'fhir', hapi: false})];
    if(includes(auth_groups, HAPI_FHIR_SERVERS_GROUP))
      eligible = [...eligible, ...filter(SERVER_CONFIGS, {type: 'fhir', hapi: true})];
  } else {
    eligible = JSON.parse(localStorage.getItem('server_configs')) || [];
  }

  eligible = compact([defaultConfig, appliedConfig, ...eligible]);
  return uniqBy(eligible, 'url');
}

export const arrayToSentence = (arr, separator, lastSeparator=' and ') => {
  if(arr.length <= 2)
    return arr.join(lastSeparator);

  const newArr = cloneDeep(arr);
  newArr.push( `${lastSeparator}${newArr.pop()}`);
  return newArr.join(separator);
}

export const generateRandomString = () => Math.random().toString(36).substring(7);
