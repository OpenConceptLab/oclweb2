import APIService from '../../services/APIService';
import { without, forEach } from 'lodash';

export const fetchSearchResults = (resource, queryParams, beforeCallback, afterCallback) => {
  if(!resource)
    resource = 'concepts';

  if(beforeCallback)
    beforeCallback(__fetchSearchResults(resource, queryParams, afterCallback));
  else
    __fetchSearchResults(resource, queryParams, afterCallback);
};

const __fetchSearchResults = (resource, queryParams, callback, method='get') => {
  if(!queryParams)
    queryParams = {};

  if(method === 'get')
  APIService[resource]()
    .get(null, {INCLUDEFACETS: true}, queryParams)
    .then(response => callback(response, resource));
  if(method === 'head')
    APIService[resource]()
    .head(null, {INCLUDEFACETS: true}, queryParams)
    .then(response => callback(response, resource));
};

export const fetchCounts = (excludeResource, queryParams, callback) => {
  let resources = without(['concepts', 'mappings', 'collections', 'sources', 'orgs', 'users'], excludeResource);
  if(!queryParams)
    queryParams = {};

  forEach(resources, resource => {
    __fetchSearchResults(resource, queryParams, callback, 'head')
  });
}
