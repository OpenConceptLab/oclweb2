import React from 'react'
import Comparison from '../common/Comparison'
import { cloneDeep, get, isEmpty, includes, has } from 'lodash'
import { useLocation } from 'react-router-dom'
import APIService from '../../services/APIService';
import { formatDate, toObjectArray, toParentURI } from '../../common/utils';


export default function SourceComparison() {
    const location = useLocation()
    const attributeState = {show: true, type: 'text'}
    const attributes = {
      description: {...cloneDeep(attributeState), position: 1},
      source_type: {...cloneDeep(attributeState), position: 2},
      custom_validation_schema: {...cloneDeep(attributeState), position: 3},
      public_access: {...cloneDeep(attributeState), position: 4},
      default_locale: {...cloneDeep(attributeState), position: 5},
      website: {...cloneDeep(attributeState), type:"url", position: 6},
      custom_resources_linked_source: {...cloneDeep(attributeState), position: 7},
      repository_type: {...cloneDeep(attributeState), position: 8},
      preferred_source: {...cloneDeep(attributeState), position: 9},
      canonical_url: {...cloneDeep(attributeState), type:"url", position: 10},
      publisher: {...cloneDeep(attributeState), position: 11},
      purpose: {...cloneDeep(attributeState), position: 12},
      copyright: {...cloneDeep(attributeState), position: 13},
      meta: {...cloneDeep(attributeState), position: 14},
      immutable: {...cloneDeep(attributeState), position: 15},
      revision_date: {...cloneDeep(attributeState), type:"url", position: 16},
      logo_url: {...cloneDeep(attributeState), type:"url", position: 17},
      text: {...cloneDeep(attributeState), position: 18},
      experimental: {...cloneDeep(attributeState), position: 19},
      locked_date: {...cloneDeep(attributeState), type:"url", position: 20},
      map_type: {...cloneDeep(attributeState), position: 21},
      external_id: {...cloneDeep(attributeState), position: 22},
      owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 23},
      extras: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 24},
      summary: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 25},
      created_by: {...cloneDeep(attributeState), position: 26},
      updated_by: {...cloneDeep(attributeState), position: 27},
      created_on: {...cloneDeep(attributeState), type: 'date', position: 28},
      updated_on: {...cloneDeep(attributeState), type: 'date', position: 29},
    }

    const fetcher = (uri, attr, loadingAttr, state) => {
        if(uri && attr && loadingAttr) {
          const { isVersion } = state;
          const isAnyVersion = isVersion || uri.match(/\//g).length === 8;
          return APIService
              .new()
              .overrideURL(encodeURI(uri))
              .get(null, null, {includeSummary: true})
              .then(response => {
              if(get(response, 'status') === 200) {
                  const newState = {...state}
                  newState[attr] = formatter(response.data)
                  newState[loadingAttr] = false
                  newState.isVersion = isAnyVersion
                  newState.attributes = attributes
                  if(isAnyVersion) {
                    newState.attributes['is_latest_version'] = {...cloneDeep(attributeState), type: 'bool', position: 14}
                    newState.attributes['update_comment'] = {...cloneDeep(attributeState), position: 15}
                  }
                  return newState
                }
            })
        }
    }

    const formatter = (source) => {
      source.originalExtras = source.extras
      source.originalSummary = source.summary
      source.extras = toObjectArray(source.extras)
      source.summary = toObjectArray(source.summary)
      return source
    }

    const getAttributeValue = (source, attr, type) => {
        let value = get(source, attr)
        if (attr === 'extras' || attr === 'summary')
          return JSON.stringify(value, undefined, 2)
        if(type === 'list') {
          if(isEmpty(value)) return '';
          else return value
        } else if(type === 'date') {
          if(attr === 'created_on')
            value ||= get(source, 'created_at')
          if(attr === 'updated_on')
            value ||= get(source, 'updated_at')
          return value ? formatDate(value) : '';
        } else if (type === 'textFormatted') {
          if(attr === 'owner')
            return `${source.owner_type}: ${source.owner}`
        } else if (type === 'bool') {
          return value ? 'True' : 'False'
        } else {
          if(includes(['created_by', 'updated_by'], attr))
            value ||= get(source, `version_${attr}`)
          if(attr === 'updated_by' && has(source, 'version_created_by'))
            value ||= source.version_created_by
          return value || '';
        }
      }

    const getHeaderSubAttributeValues = (source, isVersion) => {
        const attributes = [
          {
            name: "Source:",
            value: source.source,
            url: toParentURI(source.url)
          },
          {
            name: "UID:",
            value: source.id,
            url: null
          },
          {
            name: "Short Code:",
            value: source.short_code,
            url: null
          },
        ]
        if (isVersion) {
          attributes.push({
            name: "VERSION:",
            value: source.version,
            url: null
           })
        }
  
        return attributes
      }
    
    const getState = () => {
      if (!location.state) return null
      return {
        isVersion: true,
        isLoadingLHS: false,
        isLoadingRHS: false,
        lhs: formatter(location.state[0]),
        rhs: formatter(location.state[1]),
        drawer: false,
        attributes
      }
    }

    return <Comparison 
              fetcher={fetcher} 
              search={location.search} 
              getHeaderSubAttributeValues={getHeaderSubAttributeValues}
              getAttributeValue={getAttributeValue}
              getState={getState}
            />
}
