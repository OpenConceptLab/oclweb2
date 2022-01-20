import React from 'react'
import { cloneDeep, get, map, isEmpty, sortBy, filter, reject, uniqBy, findIndex, includes, has, keys, values } from 'lodash';
import Comparison from '../common/Comparison'
import APIService from '../../services/APIService';
import { toObjectArray, toParentURI, formatDate } from '../../common/utils';
import { useLocation } from 'react-router-dom';

const getLocaleLabelExpanded = (locale, formatted=false) => {
  if(!locale)
    return '';

  const nameAttr = has(locale, 'name') ? 'Name' : 'Description';
  const typeValue = get(locale, 'name_type') || get(locale, 'description_type') || '';
  const nameValue = get(locale, 'name') || get(locale, 'description');
  const preferredText = locale.locale_preferred ? 'True' : 'False';

  const label = [
    `Type: ${typeValue}`,
    `${nameAttr}: ${nameValue}`,
    `Locale: ${locale.locale}`,
    `Preferred: ${preferredText}`,
  ].join('\n')

  if(formatted)
    return <div key={label} style={{whiteSpace: 'break-spaces'}}>{label}</div>;

  return label;
}

const getMappingConceptName = (mapping, rel) => {
  return get(mapping, `${rel}_name`) || get(mapping, `${rel}_name_resolved`) || get(mapping, `${rel}.display_name`)
}

const getMappingLabel = (mapping, formatted=false) => {
  if(!mapping)
    return '';

  const label = [
    `UID: ${mapping.id}`,
    `Relationship: ${mapping.map_type}`,
    `Source: ${mapping.owner} / ${mapping.source}`,
    `From Concept Code: ${mapping.from_concept_code}`,
    `From Concept Name: ${getMappingConceptName(mapping, 'from_concept')}`,
    `To Concept Code: ${mapping.to_concept_code}`,
    `To Concept Name: ${getMappingConceptName(mapping, 'to_concept')}`,
  ].join('\n')

  if(formatted)
    return <div key={label} style={{whiteSpace: 'break-spaces'}}>{label}</div>;

  return label
}

export default function ConceptsComparison() {
  const location = useLocation()
  const attributeState = {show: true, type: 'text'}
  const attributes = {
    concept_class: {...cloneDeep(attributeState), position: 1},
    datatype: {...cloneDeep(attributeState), position: 1},
    display_locale: {...cloneDeep(attributeState), position: 2},
    external_id: {...cloneDeep(attributeState), position: 3},
    owner: {...cloneDeep(attributeState), type: 'textFormatted', position: 4},
    names: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 5},
    descriptions: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 6},
    parent_concept_urls: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 14},
    child_concept_urls: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 15},
    mappings: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 7},
    extras: {...cloneDeep(attributeState), collapsed: true, type: 'list', position: 8},
    retired: {...cloneDeep(attributeState), type: 'bool', position: 9},
    created_by: {...cloneDeep(attributeState), position: 10},
    updated_by: {...cloneDeep(attributeState), position: 11},
    created_on: {...cloneDeep(attributeState), type: 'date', position: 12},
    updated_on: {...cloneDeep(attributeState), type: 'date', position: 13},
  }

  const fetcher = (uri, attr, loadingAttr, state) => {
    if(uri && attr && loadingAttr) {
      const { isVersion } = state;
      const isAnyVersion = isVersion || uri.match(/\//g).length === 8;
      return APIService
        .new()
        .overrideURL(encodeURI(uri))
        .get(null, null, {includeInverseMappings: true, includeHierarchyPath: true, includeParentConceptURLs: true, includeChildConceptURLs: true})
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

  const formatter = (concept) => {
    concept.names = sortLocales(concept.names)
    concept.descriptions = sortLocales(concept.descriptions)
    concept.originalExtras = concept.extras
    concept.extras = toObjectArray(concept.extras)
    return concept
  }

  const sortLocales = locales => {
    return sortBy([
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: true}),
      ...filter(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
      ...filter(locales, {name_type: 'FULLY_SPECIFIED', locale_preferred: false}),
      ...reject(reject(locales, {name_type: 'FULLY_SPECIFIED'}), {locale_preferred: true}),
    ], 'locale')
  }

  const sortMappings = (state) => {
    if(!isEmpty(get(state.lhs, 'mappings')) && !isEmpty(get(state.rhs, 'mappings'))) {
      const newState = {...state};
      if(newState.lhs.mappings.length > newState.rhs.mappings.length) {
        newState.lhs.mappings = uniqBy([...sortBy(
          newState.rhs.mappings, m1 => findIndex(newState.lhs.mappings, m2 => m1.id === m2.id)
        ), ...newState.lhs.mappings], 'id')
      } else {
        newState.rhs.mappings = uniqBy([...sortBy(
          newState.lhs.mappings, m1 => findIndex(newState.rhs.mappings, m2 => m1.id === m2.id)
        ), ...newState.rhs.mappings], 'id')
      }

      return newState
    }
  }

  const getHeaderSubAttributeValues = (concept, isVersion) => {
    const attributes = [
      {
        name: "Source:",
        value: concept.source,
        url: toParentURI(concept.url)
      },
      {
        name: "UID:",
        value: concept.id,
        url: null
      },
    ]
    if (isVersion) {
      attributes.push({
        name: "VERSION:",
        value: concept.version,
        url: null
      })
    }

    return attributes
  }

  const getAttributeValue = (concept, attr, type, formatted=false) => {
    let value = get(concept, attr)
    if (attr === 'extras')
      return JSON.stringify(value, undefined, 2)
    if(type === 'list') {
      if(isEmpty(value)) return '';
      if(includes(['names', 'descriptions'], attr))
        return map(value, locale => getLocaleLabelExpanded(locale, formatted))
      if (attr === 'mappings')
        return map(value, mapping => getMappingLabel(mapping, formatted));
      else
        return value
    } else if(type === 'date') {
      if(attr === 'created_on')
        value ||= get(concept, 'created_at')
      if(attr === 'updated_on')
        value ||= get(concept, 'updated_at')
      return value ? formatDate(value) : '';
    } else if (type === 'textFormatted') {
      if(attr === 'owner')
        return `${concept.owner_type}: ${concept.owner}`
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

  const getExtraAttributeLabel = (val) => {
    if(!val)
      return ''
    return `${keys(val)[0]}: ${JSON.stringify(values(val)[0])}`
  }

  const getListAttributeValue = (attr, val, formatted=false) => {
    if(includes(['names', 'descriptions'], attr))
      return getLocaleLabelExpanded(val, formatted)
    if(includes(['mappings'], attr))
      return getMappingLabel(val, formatted)
    if(includes(['extras'], attr))
      return getExtraAttributeLabel(val)
    if(includes(['parent_concept_urls', 'child_concept_urls'], attr))
      return val
  }

  return <Comparison
           fetcher={fetcher}
           search={location.search}
           postFetch={sortMappings}
           getHeaderSubAttributeValues={getHeaderSubAttributeValues}
           getAttributeValue={getAttributeValue}
           getListAttributeValue={getListAttributeValue}
  />
}
