/*eslint no-process-env: 0*/
import axios from 'axios';
import {get, omit, isPlainObject, isString, defaults } from 'lodash';
import { currentUserToken, getSelectedServerConfig } from '../common/utils';

const APIServiceProvider = {};
const RESOURCES = [
  { name: 'concepts', relations: [] },
  { name: 'mappings', relations: [] },
  { name: 'orgs', relations: ['pins', 'sources', 'collections'] },
  { name: 'sources', relations: ['concepts', 'mappings'] },
  { name: 'collections', relations: ['concepts', 'mappings'] },
  { name: 'users', relations: ['login', 'signup', 'verify', 'password', 'pins', 'collections', 'sources', 'orgs'] },
  { name: 'user', relations: [] },
  { name: 'feedback', relations: [] },
  { name: 'version', relations: [] },
  { name: 'new', relations: [] },
];

const getAPIURL = () => {
  const savedConfigs = getSelectedServerConfig();
  /*eslint no-undef: 0*/
  return get(savedConfigs, 'url') || window.API_URL || process.env.API_URL;
}

class APIService {
  constructor(name, id, relations,url) {
    const apiURL = getAPIURL();
    if (name === 'empty') this.URL = `${apiURL}/`;
    else this.URL = `${apiURL}/${name}/`;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    if(url){
      this.URL=url
    }

    if (id) {
      this.URL += `${id}/`;
    }



    if (relations) {
      relations.forEach(relation=>{
        const resource = RESOURCES.find(res=>res.name === relation)
        if(!resource) return
      
        if(resource.relations.length === 0){
          this[relation] = relationId => {
                this.URL += `${relation}/${relationId ? `${relationId}/` : ''}`
                return this
             };
        }
        else{
          this[relation] = (id, query) => new APIService(resource.name, id, resource.relations, query,this.URL);
        }
      })

    }
  }

  appendToUrl(s) {
    this.URL += s;
    return this;
  }

  overrideURL(url) {
    this.URL = `${getAPIURL()}${url}`;
    return this;
  }

  head(token, headers = {}, query, raw=false) {
    return this.sendRequest('HEAD', null, token, headers, query, raw);
  }

  get(token, headers = {}, query, raw=false) {
    return this.sendRequest('GET', null, token, headers, query, raw);
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

  sendRequest(method, data, token, headers, query, raw=false) {
    const request = this.getRequest(method, data, token, headers, query);
    return axios(request)
      .then(response => response || null)
      .catch(error => {
        if(raw)
          return error;

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
