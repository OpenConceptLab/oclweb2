import React from 'react';
import {
  LocalOffer as LocalOfferIcon,
  Link as LinkIcon,
  AccountTreeRounded as TreeIcon,
  List as ListIcon,
  Person as PersonIcon,
  AccountBalance as HomeIcon,
  Loyalty as LoyaltyIcon,
  AspectRatio as ExpansionIcon
} from '@mui/icons-material'
import { get, find, isEmpty, flatten, compact } from 'lodash';
import {
  formatDate, formatWebsiteLink, formatDateTime, formatWebsiteLinkTruncated
} from '../../common/utils';
import ReferenceChip from '../common/ReferenceChip';
import ReferenceTranslation from '../common/ReferenceTranslation';
import OwnerChip from '../common/OwnerChip';
import ToConceptLabelVertical from '../mappings/ToConceptLabelVertical';
import FromConceptLabelVertical from '../mappings/FromConceptLabelVertical';
import ConceptDisplayName from '../concepts/ConceptDisplayName';

const onVersionClick = (event, resource) => {
  event.stopPropagation()
  event.preventDefault()
  window.location.hash = '#' + resource.owner_url + 'sources/' + resource.source + '/' + resource?.latest_source_version
}


export const ALL_COLUMNS = {
  concepts: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: concept => <OwnerChip ownerType={concept.owner_type} owner={concept.owner} className='owner-chip-no-border' />, essential: false},
    {id: 'parent', label: 'Source', value: 'source', sortOn: 'source', essential: false},
    {id: 'id', label: 'ID', value: 'id', sortOn: 'id_lowercase', className: 'small searchable'},
    {id: 'name', label: 'Name', value: 'display_name', sortOn: '_name', renderer: concept => (<ConceptDisplayName concept={concept} />), className: 'medium searchable', sortBy: 'asc', tooltip: 'The display name is the preferred name for a source’s default locale.'},
    {id: 'class', label: 'Class', value: 'concept_class', sortOn: 'concept_class'},
    {id: 'datatype', label: 'Datatype', value: 'datatype', sortOn: 'datatype'},
    {id: 'latest_source_version', label: 'Source Version', value: 'latest_source_version', renderer: concept => (<a onClick={onVersionClick} href={'#' + concept.owner_url + 'sources/' + concept.source + '/' + concept?.latest_source_version } target='_blank' rel='noopener noreferrer'>{concept?.latest_source_version}</a>), essential: false}
  ],
  mappings: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: mapping => <OwnerChip ownerType={mapping.owner_type} owner={mapping.owner} className='owner-chip-no-border' />, essential: false},
    {id: 'parent', label: 'Source', value: 'source', sortOn: 'source', essential: false, className: 'xsmall'},
    {id: 'id', label: 'ID', value: 'id', sortOn: 'id_lowercase', className: 'small searchable', renderer: mapping => <span className={mapping.retired ? 'retired' : ''}>{mapping.id}</span>},
    {id: 'from', label: 'From Concept', renderer: mapping => <FromConceptLabelVertical {...mapping} noRedirect />, className: 'medium searchable'},
    {id: 'mapType', label: 'Type', value: 'map_type', sortOn: 'map_type', className: 'xxsmall', renderer: mapping => <span className={mapping.retired ? 'retired' : ''}>{mapping.map_type}</span>},
    {id: 'to', label: 'To Concept', renderer: mapping => <ToConceptLabelVertical {...mapping} noRedirect />, className: 'medium searchable'},
    {id: 'latest_source_version', label: 'Source Version', value: 'latest_source_version', renderer: mapping => (<a onClick={onVersionClick} href={'#' + mapping.owner_url + 'sources/' + mapping?.source + '/' + mapping?.latest_source_version } target='_blank' rel='noopener noreferrer'>{mapping?.latest_source_version}</a>), essential: false}
  ],
  sources: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: source => <OwnerChip ownerType={source.owner_type} owner={source.owner} className='owner-chip-no-border' />, essential: false},
    {id: 'id', label: 'ID', value: 'short_code', sortOn: '_mnemonic', className: 'searchable', renderer: source => <span><div>{source.short_code}</div><div style={{fontSize: '11px'}}>{formatWebsiteLinkTruncated(source.canonical_url)}</div></span>},
    {id: 'name', label: 'Name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'source_type', label: 'Type', value: 'source_type', sortOn: 'source_type'},
    {id: 'canonical_url', label: 'Canonical URL', value: 'canonical_url', sortable: false, formatter: formatWebsiteLinkTruncated, className: 'searchable'},
    {id: 'uuid', label: 'UUID', value: 'uuid', sortable: false},
    {id: 'full_name', label: 'Full Name', value: 'full_name', sortOn: 'full_name', sortBy: 'asc'},
    {id: 'description', label: 'Description', value: 'description', sortable: false},
    {id: 'public_access', label: 'Public Access', value: 'public_access', sortable: false},
    {id: 'default_locale', label: 'Default Locale', value: 'default_locale', sortable: false},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'external_id', label: 'External ID', value: 'external_id', sortable: false},
    {id: 'publisher', label: 'Publisher', value: 'publisher', sortable: false},
    {id: 'purpose', label: 'Purpose', value: 'purpose', sortable: false},
    {id: 'copyright', label: 'Copyright', value: 'copyright', sortable: false},
    {id: 'content_type', label: 'Content Type', value: 'content_type', sortable: false},
    {id: 'revision_date', label: 'Revision Date', value: 'revision_date', sortable: false, formatter: formatDate},
  ],
  collections: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: coll => <OwnerChip ownerType={coll.owner_type} owner={coll.owner} className='owner-chip-no-border' />, essential: false},
    {id: 'id', label: 'ID', value: 'short_code', sortOn: '_mnemonic', className: 'searchable', renderer: coll => <span><div>{coll.short_code}</div><div style={{fontSize: '11px'}}>{formatWebsiteLinkTruncated(coll.canonical_url)}</div></span>},
    {id: 'name', label: 'Name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'collectionType', label: 'Type', value: 'collection_type', sortOn: 'collection_type'},
    {id: 'full_name', label: 'Full Name', value: 'full_name', sortOn: 'full_name', sortBy: 'asc'},
    {id: 'canonical_url', label: 'Canonical URL', value: 'canonical_url', sortable: false, formatter: formatWebsiteLinkTruncated, className: 'searchable'},
    {id: 'uuid', label: 'UUID', value: 'uuid', sortable: false},
    {id: 'description', label: 'Description', value: 'description', sortable: false},
    {id: 'public_access', label: 'Public Access', value: 'public_access', sortable: false},
    {id: 'default_locale', label: 'Default Locale', value: 'default_locale', sortable: false},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'external_id', label: 'External ID', value: 'external_id', sortable: false},
    {id: 'publisher', label: 'Publisher', value: 'publisher', sortable: false},
    {id: 'purpose', label: 'Purpose', value: 'purpose', sortable: false},
    {id: 'copyright', label: 'Copyright', value: 'copyright', sortable: false},
    {id: 'revision_date', label: 'Revision Date', value: 'revision_date', sortable: false, formatter: formatDate},
  ],
  organizations: [
    {id: 'id', label: 'ID', value: 'id', sortOn: '_mnemonic', renderer: org => <OwnerChip ownerType='Organization' owner={org.id} className='owner-chip-no-border' />, className: 'searchable'},
    {id: 'name', label: 'Name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'createdOn', label: 'Created On', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
  ],
  users: [
    {id: 'username', label: 'Username', value: 'username', sortOn: '_username', renderer: user => <OwnerChip ownerType='user' owner={user.username} className='owner-chip-no-border' />, sortBy: 'asc', className: 'searchable'},
    {id: 'name', label: 'Name', value: 'name', sortOn: '_name', sortBy: 'asc', className: 'searchable'},
    {id: 'date_joined', label: 'Joined On', value: 'date_joined', formatter: formatDate, sortOn: 'date_joined'},
    {id: 'email', label: 'Email', value: 'email', sortable: false},
    {id: 'company', label: 'Company', value: 'company'},
    {id: 'location', label: 'Location', value: 'location'},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'last_login', label: 'Last Login', value: 'last_login', sortable: false, formatter: formatDateTime},
  ],
  references: [
    {id: 'expression', label: 'Reference', value: 'expression', sortable: false, translation: true, renderer: (reference, translation) => translation ? <ReferenceTranslation {...reference} /> : <ReferenceChip {...reference} />},
    {id: 'concepts', label: 'Concepts', value: 'concepts', sortable: false, align: 'center', renderer: reference => reference.last_resolved_at ? <ReferenceChip uri={reference.uri + 'concepts/'} reference_type='concepts' last_resolved_at expression={reference.concepts} notReference /> : '-'},
    {id: 'mappings', label: 'Mappings', value: 'mappings', sortable: false, align: 'center', renderer: reference => reference.last_resolved_at ? <ReferenceChip uri={reference.uri + 'mappings/'} reference_type='mappings' last_resolved_at expression={reference.mappings} notReference /> : '-'}
  ],
  CodeSystem: [
    {id: '_id', label: 'ID', value: 'resource.id', sortOn: '_id', sortBy: 'asc'},
    {id: 'url', label: 'Canonical URL', value: 'resource.url', sortable: false},
    {id: 'name', label: 'Name', value: 'resource.name', renderer: codeSystem => <span className={codeSystem.resource.status}>{codeSystem.resource.name}</span>, sortOn: 'name', sortBy: 'asc'},
    {id: 'version', label: 'Latest Version', value: 'resource.version', sortOn: 'version', sortBy: 'asc'},
    {id: 'status', label: 'Status', value: 'resource.status', sortOn: 'status', sortBy: 'asc'},
    {id: 'content', label: 'Content', value: 'resource.content', sortOn: 'content', sortBy: 'asc'},
    {id: 'date', label: 'Release Date', value: 'resource.date', sortOn: 'date', formatter: formatDate},
    {id: 'publisher', label: 'Publisher', value: 'resource.publisher', sortOn: 'publisher', sortBy: 'asc'},
  ],
  ValueSet: [
    {id: '_id', label: 'ID', value: 'resource.id', sortOn: '_id', sortBy: 'asc'},
    {id: 'url', label: 'Canonical URL', value: 'resource.url', sortable: false},
    {id: 'name', label: 'Name', value: 'resource.name', renderer: codeSystem => <span className={codeSystem.resource.status}>{codeSystem.resource.name}</span>, sortOn: 'name', sortBy: 'asc'},
    {id: 'version', label: 'Latest Version', value: 'resource.version', sortOn: 'version', sortBy: 'asc'},
    {id: 'status', label: 'Status', value: 'resource.status', sortOn: 'status', sortBy: 'asc'},
    {id: 'date', label: 'Release Date', value: 'resource.date', sortOn: 'date', formatter: formatDate},
    {id: 'publisher', label: 'Publisher', value: 'resource.publisher', sortOn: 'publisher', sortBy: 'asc'},
  ],
  ConceptMap: [
    {id: '_id', label: 'ID', value: 'resource.id', sortOn: '_id', sortBy: 'asc'},
    {id: 'url', label: 'Canonical URL', value: 'resource.url', sortable: false},
    {id: 'name', label: 'Name', value: 'resource.title', renderer: codeSystem => <span className={codeSystem.resource.status}>{codeSystem.resource.title}</span>, sortOn: 'title', sortBy: 'asc'},
    {id: 'version', label: 'Latest Version', value: 'resource.version', sortOn: 'version', sortBy: 'asc'},
    {id: 'status', label: 'Status', value: 'resource.status', sortOn: 'status', sortBy: 'asc'},
    {id: 'date', label: 'Release Date', value: 'resource.date', sortOn: 'date', formatter: formatDate},
    {id: 'publisher', label: 'Publisher', value: 'resource.publisher', sortOn: 'publisher', sortBy: 'asc'},
  ]
};


export const HIGHLIGHT_ICON_WHITELISTED_FILEDS = {
  concepts: ['external_id', 'same_as_map_codes', 'other_map_codes'],
  mappings: ['external_id'],
  sources: ['external_id'],
  collections: ['external_id'],
  organizations: ['external_id'],
  users: ['external_id'],
}

const TAG_ICON_STYLES = {width: '12px', marginRight: '2px', marginTop: '2px'}
export const CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS = [
  {
    id: 'activeConcepts',
    value: 'summary.active_concepts',
    label: 'Concepts',
    icon: <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />,
    hrefAttr: 'concepts_url'
  },
  {
    id: 'activeMappings',
    value: 'summary.active_mappings',
    label: 'Mappings',
    icon: <LinkIcon fontSize='small' style={TAG_ICON_STYLES} />,
    hrefAttr: 'mappings_url'
  },
]
const CONCEPT_CONTAINER_TAGS = [
  ...CONCEPT_CONTAINER_RESOURCE_CHILDREN_TAGS,
  {
    id: 'versions',
    value: 'summary.versions',
    label: 'Versions',
    icon: <TreeIcon fontSize='small' style={TAG_ICON_STYLES} />,
    hrefAttr: 'versions_url'
  },
]

const getOCLFHIRResourceURL = item => {
  const identifiers = flatten([get(item, 'resource.identifier', [])])
  return '/fhir/' + compact(get(find(identifiers, ident => get(ident, 'system', '').match('fhir.')), 'value', '').split('/')).splice(0, 4).join('/')
}
const CODE_SYSTEM_TAGS = [
  {
    id: 'count',
    getValue: item => (get(item, 'resource.count') || (get(item, 'resource.concept', []) || []).length).toLocaleString(),
    label: 'Concepts',
    icon: <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />,
    hrefAttr: (item, hapi) => hapi ? `/fhir/CodeSystem/${item.resource.id}/` : getOCLFHIRResourceURL(item)
  },
]
const VALUE_SET_TAGS = [
  {
    id: 'count',
    getValue: item => {
      const concepts = get(item, 'resource.count') ||
                       get(find(get(item, 'resource.compose.include', []), inc => !isEmpty(get(inc, 'concept'))), 'concept', []).length ||
                       0;
      return concepts.toLocaleString()
    },
    label: 'Concepts',
    icon: <LocalOfferIcon fontSize='small' style={TAG_ICON_STYLES} />,
    hrefAttr: (item, hapi) => hapi ? `/fhir/ValueSet/${item.resource.id}/` : getOCLFHIRResourceURL(item)
  },
]

export const CODE_SYSTEM_VERSION_TAGS = [...CODE_SYSTEM_TAGS]
export const VALUE_SET_VERSION_TAGS = [...VALUE_SET_TAGS]

const SOURCE_TAG = {
  id: 'sources',
  value: 'public_sources',
  label: 'Public Sources',
  icon: <ListIcon fontSize='small' style={TAG_ICON_STYLES} />,
  hrefAttr: 'sources_url'
}
const COLLECTION_TAG = {
  id: 'collections',
  value: 'public_collections',
  label: 'Public Collections',
  icon: <LoyaltyIcon fontSize='small' style={TAG_ICON_STYLES} />,
  hrefAttr: 'collections_url'
}
export const TAGS = {
  sources: [...CONCEPT_CONTAINER_TAGS],
  collections: [
    ...CONCEPT_CONTAINER_TAGS,
    {
      id: 'activeReferences',
      value: 'summary.active_references',
      label: 'References',
      icon: <i className="icon-link" style={{ fontSize: "small", ...TAG_ICON_STYLES }} />,
      hrefAttr: (item) => item.version_url || item.url + 'references/',
      style: {marginTop: '8px', marginBottom: '5px'}
    },
    {
      id: 'expansions',
      value: 'summary.expansions',
      label: 'Expansions',
      icon: <ExpansionIcon fontSize='small' style={{...TAG_ICON_STYLES, marginRight: '3px'}} />,
      hrefAttr: 'versions_url'
    },
  ],
  organizations: [
    {
      id: 'members',
      value: 'members',
      label: 'Members',
      icon: <PersonIcon fontSize='small' style={TAG_ICON_STYLES} />,
      hrefAttr: 'url'
    },
    SOURCE_TAG,
    COLLECTION_TAG,
  ],
  users: [
    {
      id: 'orgs',
      value: 'orgs',
      label: 'Organizations',
      icon: <HomeIcon fontSize='small' style={TAG_ICON_STYLES} />,
      hrefAttr: 'organizations_url'
    },
    SOURCE_TAG,
    COLLECTION_TAG,
  ],
  CodeSystem: [...CODE_SYSTEM_TAGS],
  ValueSet: [...VALUE_SET_TAGS]
}
export const FACET_ORDER = {
  concepts: ['owner', 'ownerType', 'source', 'conceptClass', 'datatype', 'locale', 'retired', 'collection_membership', 'nameTypes', 'descriptionTypes'],
  mappings: [
    'owner', 'ownerType', 'source', 'mapType',
    'fromConceptOwner', 'fromConceptOwnerType', 'fromConceptSource', 'fromConcept',
    'toConceptOwner', 'toConceptOwnerType', 'toConceptSource', 'toConcept',
    'retired', 'collection_membership',
  ]
}

export const SORT_ATTRS = {
  concepts: ['score', 'last_update', 'id', 'numeric_id', '_name', 'concept_class', 'datatype', 'source', 'owner'],
  mappings: ['score', 'last_update', 'id', 'map_type', 'source', 'owner'],
  users: ['score', 'username', 'date_joined', 'company', 'location'],
  organizations: ['score', 'last_update', 'name', 'mnemonic'],
  sources: ['score', 'last_update', 'mnemonic', 'source_type', 'name', 'owner', 'canonical_url'],
  collections: ['score', 'last_update', 'mnemonic', 'collection_type', 'name', 'owner', 'canonical_url'],
}
