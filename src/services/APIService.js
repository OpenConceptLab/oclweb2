/*eslint no-process-env: 0*/
import axios from 'axios';
import {get, omit, isPlainObject, isString, defaults } from 'lodash';
import { currentUserToken } from '../common/utils';

/*eslint no-undef: 0*/
const APIURL = window.API_URL || process.env.API_URL;
const APIServiceProvider = {};
const RESOURCES = [
  { name: 'concepts', relations: [] },
  { name: 'mappings', relations: [] },
  { name: 'orgs', relations: [] },
  { name: 'sources', relations: [] },
  { name: 'collections', relations: [] },
  { name: 'users', relations: ['login'] },
  { name: 'user', relations: [] },
  { name: 'new', relations: [] },
];

class APIService {
  constructor(name, id, relations) {
    if (name === 'empty') this.URL = `${APIURL}/`;
    else this.URL = `${APIURL}/${name}/`;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
    this.URL = `${APIURL}${url}`;
    return this;
  }

  head(token, headers = {}, query) {
    return this.sendRequest('HEAD', null, token, headers, query);
  }

  get(token, headers = {}, query) {
    return this.sendRequest('GET', null, token, headers, query);
  }

  post(data, token, headers = {}, query) {
    return this.sendRequest('POST', data, token, headers, query);
  }

  put(data, token, headers = {}, query) {
    return this.sendRequest('PUT', data, token, headers, query);
  }

  delete(token, headers = {}, query) {
    return this.sendRequest('DELETE', null, token, headers, query);
  }

  sendRequest(method, data, token, headers, query) {
    const request = this.getRequest(method, data, token, headers, query);
    return axios(request)
      .then(response => response || null)
      .catch(error => {
        return error.response ? error.response.data : error.message;
      });
  }

  getRequest(method, data, token, headers, query) {
    return {
      url: this.URL,
      method,
      headers: this.getHeaders(token, headers),
      params: this.getQueryParams(query),
      data,
    };
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
    return axios(request);
  };

  getHeaders(token, headers) {
    token = token || currentUserToken();
    const obj = defaults(headers, this.headers);
    if (token) obj['Authorization'] = `Token ${token}`;
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
