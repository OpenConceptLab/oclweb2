import React from 'react'
import Comparison from '../common/Comparison'
import { cloneDeep, get, isEmpty, includes, has } from 'lodash'
import { useLocation } from 'react-router-dom'
import APIService from '../../services/APIService';
import { formatDate, toObjectArray, toParentURI } from '../../common/utils';


export default function MappingsComparison() {
    const location = useLocation()
    const attributeState = {show: true, type: 'text'}
    const attributes = {
        map_type: {...cloneDeep(attributeState), position: 1},
        external_id: {...cloneDeep(attributeState), position: 2},
        owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 3},
        from_source_owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 4},
        to_source_owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 5},
        extras: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 6},
        retired: {...cloneDeep(attributeState), type: 'bool', position: 7},
        created_by: {...cloneDeep(attributeState), position: 8},
        updated_by: {...cloneDeep(attributeState), position: 9},
        created_on: {...cloneDeep(attributeState), type: 'date', position: 10},
        updated_on: {...cloneDeep(attributeState), type: 'date', position: 11},
    }

    const fetcher = (uri, attr, loadingAttr, state) => {
        if(uri && attr && loadingAttr) {
          const { isVersion } = state;
          const isAnyVersion = isVersion || uri.match(/\//g).length === 8;
          return APIService
              .new()
              .overrideURL(encodeURI(uri))
              .get()
              .then(response => {
              if(get(response, 'status') === 200) {
                  const newState = {...state}
                  newState[attr] = formatter(response.data)
                  newState[loadingAttr] = false
                  newState.isVersion = isAnyVersion
                  newState.attributes = attributes
                  if(isAnyVersion) {
                    newState.attributes['is_latest_version'] = {...cloneDeep(this.attributeState), type: 'bool', position: 14}
                    newState.attributes['update_comment'] = {...cloneDeep(this.attributeState), position: 15}
                  }
                  return newState
                }
            })
        }
    }

    const formatter = (mapping) => {
        mapping.originalExtras = mapping.extras
        mapping.extras = toObjectArray(mapping.extras)
        return mapping
    }

    const getAttributeValue = (concept, attr, type) => {
        let value = get(concept, attr)
        if (attr === 'extras')
          return JSON.stringify(value, undefined, 2)
        if(type === 'list') {
          if(isEmpty(value)) return '';
          else return value
        } else if(type === 'date') {
          if(attr === 'created_on')
            value ||= get(concept, 'created_at')
          if(attr === 'updated_on')
            value ||= get(concept, 'updated_at')
    
          return value ? formatDate(value) : '';
        } else if (type === 'textFormatted') {
          if(attr === 'owner')
            return `${concept.owner_type}: ${concept.owner}`
          if(attr === 'to_source_owner')
            return `${concept.to_source_owner_type}: ${concept.to_source_owner}`
          if(attr === 'from_source_owner')
            return `${concept.from_source_owner_type}: ${concept.from_source_owner}`
        } else if (type === 'bool') {
          return value ? 'True' : 'False'
        } else {
          if(includes(['created_by', 'updated_by'], attr))
            value ||= get(concept, `version_${attr}`)
          if(attr === 'updated_by' && has(concept, 'version_created_by'))
            value ||= concept.version_created_by
          return value || '';
        }
      }

    const getHeaderSubAttributeValues = (mapping, isVersion) => {
        const attributes = [
          {
            name: "Source:",
            value: mapping.source,
            url: toParentURI(mapping.url)
          },
          {
            name: "UID:",
            value: mapping.id,
            url: null
           },
          {
            name: "From Concept:",
            value: mapping.from_concept_name,
            url: mapping.from_concept_url
          },
          {
            name: "To Concept:",
            value: mapping.to_concept_name,
            url: mapping.to_concept_url
          },
          {
            name: "From Source:",
            value: mapping.from_source_name,
            url: mapping.from_source_url
          },
          {
            name: "To Source:",
            value: mapping.to_source_name,
            url: mapping.to_source_url
          },
        ]
        if (isVersion) {
          attributes.push({
            name: "VERSION:",
            value: mapping.version,
            url: null
           })
        }
  
        return attributes
      }

    return <Comparison 
              fetcher={fetcher} 
              search={location.search} 
              getHeaderSubAttributeValues={getHeaderSubAttributeValues}
              getAttributeValue={getAttributeValue}
            />
}
