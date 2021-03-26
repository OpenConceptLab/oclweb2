import APIService from '../../services/APIService';
import { without, forEach } from 'lodash';

export const fetchSearchResults = (resource, queryParams, hasHeaders, baseURL, beforeCallback, afterCallback) => {
  if(!resource)
    resource = 'concepts';

  if(beforeCallback)
    beforeCallback(__fetchSearchResults(resource, queryParams, hasHeaders, baseURL, afterCallback));
  else
    __fetchSearchResults(resource, queryParams, hasHeaders, baseURL, afterCallback);
};

const __fetchSearchResults = (resource, queryParams, hasHeaders, baseURL, callback, method='get') => {
  if(!queryParams)
    queryParams = {};

  let service;

  if(baseURL)
    service = APIService.new().overrideURL(baseURL);
  else if(resource)
    service = APIService[resource]();

  let headers = {}
  if(hasHeaders)
    headers = {INCLUDEFACETS: true}

  if(method === 'get')
    service
    .get(null, headers, queryParams)
    .then(response => callback(response, resource));
  if(method === 'head')
    service
    .head(null, headers, queryParams)
    .then(response => callback(response, resource));
};

export const fetchCounts = (excludeResource, queryParams, callback) => {
  let resources = without(['concepts', 'mappings', 'collections', 'sources', 'orgs', 'users'], excludeResource);
  if(!queryParams)
    queryParams = {};

  forEach(resources, resource => {
    __fetchSearchResults(resource, queryParams, true, null, callback, 'head')
  });
}
