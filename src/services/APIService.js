/*eslint no-process-env: 0*/
import axios from 'axios';
import {get, omit, isPlainObject, isString, defaults } from 'lodash';
import { currentUserToken, getAPIURL } from '../common/utils';
import { OCL_CLIENT } from '../common/constants';


const APIServiceProvider = {};
const REFUSED_MESSAGE = 'Refused a request outside the OCL API';

const originOf = url => {
  try {
    return new URL(url, window.location.origin).origin;
  } catch (e) {
    return null;
  }
};

// True only when `url` is an absolute URL on the OCL API's own origin.
export const isAPIOrigin = url => {
  const apiOrigin = originOf(getAPIURL());
  return Boolean(apiOrigin) && originOf(url) === apiOrigin;
};

// A path starting with exactly one '/' (not '//' and not '/\\').
const isSinglePath = url => isString(url) && /^\/(?![/\\])/.test(url);
const isAbsoluteURL = url => isString(url) && /^[a-z][a-z0-9+.-]*:\/\//i.test(url);

const RESOURCES = [
  { name: 'concepts', relations: [] },
  { name: 'mappings', relations: [] },
  { name: 'orgs', relations: ['pins', 'sources', 'collections'] },
  { name: 'sources', relations: ['concepts', 'mappings'] },
  { name: 'collections', relations: ['concepts', 'mappings'] },
  { name: 'users', relations: ['login', 'signup', 'verify', 'password', 'pins', 'collections', 'sources', 'orgs'] },
  { name: 'user', relations: ['orgs'] },
  { name: 'feedback', relations: [] },
  { name: 'version', relations: [] },
  { name: 'locales', relations: [] },
  { name: 'toggles', relations: [] },
  { name: 'new', relations: [] },
];

class APIService {
  constructor(name, id, relations) {
    const apiURL = getAPIURL();
    if (name === 'empty') this.URL = `${apiURL}/`;
    else this.URL = `${apiURL}/${name}/`;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: '*/*'
    };

    if (id) {
      this.URL += `${id}/`;
    }
    if (relations) {
      relations.forEach(relation => {
        this[relation] = relationId => {
          this.URL += `${relation}/${relationId ? `${relationId}/` : ''}`;
          return this;
        };
      });
    }
  }

  appendToUrl(s) {
    this.URL += s;
    return this;
  }

  overrideURL(url) {
    // Never throws: a refused value is remembered and rejected when the request is sent.
    if(isSinglePath(url)) {
      this.URL = `${getAPIURL()}${url}`;
    } else if(isAbsoluteURL(url) && isAPIOrigin(url)) {
      this.URL = url;
    } else {
      this.URL = '';
      this.refused = true;
    }
    return this;
  }

  // Requests that carry the user's token only go to the OCL API's origin.
  isAllowed(request) {
    if(this.refused)
      return false;
    if(!get(request, 'headers.Authorization'))
      return true;
    return isAPIOrigin(request.url);
  }

  head(token, headers = {}, query, raw=false) {
    return this.sendRequest('HEAD', null, token, headers, query, raw);
  }

  get(token, headers = {}, query, raw=false) {
    return this.sendRequest('GET', null, token, headers, query, raw);
  }

  getBlob(token, headers = {}, query) {
    return this.sendRequest('GET', null, token, headers, query, true, true);
  }

  post(data, token, headers = {}, query, raw=false) {
    return this.sendRequest('POST', data, token, headers, query, raw);
  }

  put(data, token, headers = {}, query, raw=false) {
    return this.sendRequest('PUT', data, token, headers, query, raw);
  }

  delete(data, token, headers = {}, query, raw=false) {
    return this.sendRequest('DELETE', data, token, headers, query, raw);
  }

  sendRequest(method, data, token, headers, query, raw=false, blob=false) {
    const request = this.getRequest(method, data, token, headers, query, blob);
    if(!this.isAllowed(request))
      return Promise.reject(new Error(REFUSED_MESSAGE));
    return axios(request)
      .then(response => response || null)
      .catch(error => {
        if(raw)
          return error;

        return error.response ? error.response.data : error.message;
      });
  }

  getRequest(method, data, token, headers, query, blob=false) {
    const request = {
      url: this.URL,
      method,
      headers: headers === false ? {} : this.getHeaders(token, headers),
      params: this.getQueryParams(query),
      data,
    };
    if(blob)
      request.responseType = 'blob'
    return request
  }

  request(method, data, token, config) {
    let headers = {};
    let query = {};
    if (isPlainObject(config)) {
      headers = get(config, 'headers', {});
      query = get(config, 'query', {});
    }
    let request = this.getRequest(method, data, token, headers, query);
    request = {...request, ...omit(config, ['headers', 'query'])};
    if(!this.isAllowed(request))
      return Promise.reject(new Error(REFUSED_MESSAGE));
    return axios(request);
  };

  getHeaders(token, headers) {
    token = token || (token !== false ? currentUserToken() : token);
    const obj = defaults(headers, this.headers);
    if (token) obj['Authorization'] = `Token ${token}`;
    obj['X-OCL-CLIENT'] = OCL_CLIENT;
    return obj;
  }

  getQueryParams(query) {
    if (isPlainObject(query)) {
      return query;
    }
    if (isString(query)) {
      const questionMarkSplit = query.split('?');
      if (questionMarkSplit.length === 2) {
        const params = {};
        const ampersandSplit = questionMarkSplit[1].split('&');
        ampersandSplit.forEach(param => {
          const paramSplit = param.split('=');
          params[paramSplit[0]] = get(paramSplit, '[1]', true);
        });
        return params;
      }
    }
    return {};
  }
}

RESOURCES.forEach(resource => {
  APIServiceProvider[resource.name] = (id, query) => new APIService(resource.name, id, resource.relations, query);
});

export default APIServiceProvider;
