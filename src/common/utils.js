/*eslint no-process-env: 0*/
import alertifyjs from 'alertifyjs';
import moment from 'moment';
import {
  filter, difference, compact, find, reject, intersectionBy, size, keys, omitBy, isEmpty,
  get, includes, map, isArray, values, pick, sortBy, zipObject
} from 'lodash';
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
  return filter(mappings, {to_concept_code: concept});
}

export const getDirectMappings = (mappings, concept) => {
  return filter(mappings, {from_concept_code: concept});
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

export const toParentURI = uri => {
  return uri.split('/').splice(0, 5).join('/');
};

export const toOwnerURI = uri => {
  return uri.split('/').splice(0, 3).join('/');
};

export const headFirst = versions => {
  return compact([
    find(versions, {version: 'HEAD'}), ...reject(versions, {version: 'HEAD'})
  ]);
};

export const currentUserToken = () => {
  return localStorage.token;
};

export const isLoggedIn = () => {
  return Boolean(currentUserToken());
};

export const getCurrentUser = () => {
  const data = localStorage.user;
  if(data)
    return JSON.parse(data);

  return null;
};

export const getCurrentUserOrgs = () => {
  return get(getCurrentUser(), 'subscribed_orgs');
};

export const getCurrentUserUsername = () => {
  return get(getCurrentUser(), 'username');
};

export const nonEmptyCount = (object, attributes) => {
  return size(intersectionBy(keys(omitBy(
    object, val => (isEmpty(val) || includes(['none', 'None'], val))
  )), attributes));
}

export const isCurrentUserMemberOf = orgId => {
  return orgId && includes(map(getCurrentUserOrgs(), 'id'), orgId);
}

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

export const toObjectArray = obj => {
  if(isEmpty(obj))
    return [];

  return map(keys(obj), k => pick(obj, k));
}

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

export const currentUserHasAccess = url => {
  if(!isLoggedIn())
    return false;
  if(isAdminUser())
    return true;
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

export const isSubscribedTo = org => {
  return org && includes(get(getCurrentUser(), 'subscribed_orgs'), org);
}

export const getCurrentURL = () => {
  return window.location.href.replace(new RegExp('/$'), '');
}
