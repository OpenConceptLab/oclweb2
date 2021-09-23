import APIService from '../../services/APIService';
import { without, forEach } from 'lodash';

export const fetchSearchResults = (resource, queryParams, baseURL, beforeCallback, afterCallback) => {
  if(!resource)
    resource = 'concepts';

  if(beforeCallback)
    beforeCallback(__fetchSearchResults(resource, queryParams, baseURL, afterCallback));
  else
    __fetchSearchResults(resource, queryParams, baseURL, afterCallback);
};

const __fetchSearchResults = (resource, queryParams, baseURL, callback, method='get') => {
  if(!queryParams)
    queryParams = {};

  let service;

  if(baseURL)
    service = APIService.new().overrideURL(baseURL);
  else if(resource)
    service = APIService[resource]();

  if(method === 'get')
    service
    .get(null, {}, queryParams)
    .then(response => callback(response, resource));
  if(method === 'head')
    service
    .head(null, {}, queryParams)
    .then(response => callback(response, resource));
};

export const fetchCounts = (excludeResource, queryParams, callback) => {
  let resources = without(['concepts', 'mappings', 'collections', 'sources', 'orgs', 'users'], excludeResource);
  if(!queryParams)
    queryParams = {};

  forEach(resources, resource => {
    __fetchSearchResults(resource, queryParams, null, callback, 'head')
  });
}

export const fetchFacets = (resource, queryParams, baseURL, callback) => {
  if(!queryParams)
    queryParams = {}
  queryParams.facetsOnly = true

  __fetchSearchResults(resource, queryParams, baseURL, callback)
}
