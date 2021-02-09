import React from 'react';
import {
  formatDate, formatWebsiteLink, formatDateTime
} from '../../common/utils';
import ReferenceChip from '../common/ReferenceChip';
import OwnerChip from '../common/OwnerChip';
import ToConceptLabel from '../mappings/ToConceptLabel';
import FromConceptLabel from '../mappings/FromConceptLabel';

export const ALL_COLUMNS = {
  concepts: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: concept => <OwnerChip ownerType={concept.owner_type} owner={concept.owner} />, essential: false},
    {id: 'parent', label: 'Source', value: 'source', sortOn: 'source', essential: false},
    {id: 'id', label: 'ID', value: 'id', sortOn: 'id', className: 'small'},
    {id: 'name', label: 'Name', value: 'display_name', sortOn: 'name', renderer: concept => (concept.retired ? <span className='retired'>{concept.display_name}</span> : <span>{concept.display_name}</span>), className: 'medium'},
    {id: 'class', label: 'Class', value: 'concept_class', sortOn: 'concept_class'},
    {id: 'datatype', label: 'Datatype', value: 'datatype', sortOn: 'datatype'},
    {id: 'updatedOn', label: 'UpdatedOn', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update'},
  ],
  mappings: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: mapping => <OwnerChip ownerType={mapping.owner_type} owner={mapping.owner} />, essential: false},
    {id: 'parent', label: 'Source', value: 'source', sortOn: 'source', essential: false, className: 'xsmall'},
    {id: 'id', label: 'ID', value: 'id', sortOn: 'id', className: 'small'},
    {id: 'from', label: 'From Concept', renderer: mapping => <FromConceptLabel {...mapping} noRedirect />, className: 'medium'},
    {id: 'mapType', label: 'Type', value: 'map_type', sortOn: 'map_type', className: 'xxsmall'},
    {id: 'to', label: 'To Concept', renderer: mapping => <ToConceptLabel {...mapping} noRedirect />, className: 'medium'},
    {id: 'updatedOn', label: 'UpdatedOn', value: 'version_created_on', formatter: formatDate, sortOn: 'last_update', className: 'xxsmall'},
  ],
  sources: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: source => <OwnerChip ownerType={source.owner_type} owner={source.owner} />},
    {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
    {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
    {id: 'sourceType', label: 'Type', value: 'source_type', sortOn: 'source_type'},
    {id: 'uuid', label: 'UUID', value: 'uuid', sortable: false},
    {id: 'full_name', label: 'Full Name', value: 'full_name', sortOn: 'full_name'},
    {id: 'description', label: 'Description', value: 'description', sortable: false},
    {id: 'public_access', label: 'Public Access', value: 'public_access', sortable: false},
    {id: 'default_locale', label: 'Default Locale', value: 'default_locale', sortable: false},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'external_id', label: 'External ID', value: 'external_id', sortable: false},
    {id: 'canonical_url', label: 'Canonical URL', value: 'canonical_url', sortable: false, formatter: formatWebsiteLink},
    {id: 'publisher', label: 'Publisher', value: 'publisher', sortable: false},
    {id: 'purpose', label: 'Purpose', value: 'purpose', sortable: false},
    {id: 'copyright', label: 'Copyright', value: 'copyright', sortable: false},
    {id: 'content_type', label: 'Content Type', value: 'content_type', sortable: false},
    {id: 'revision_date', label: 'Revision Date', value: 'revision_date', sortable: false, formatter: formatDate},
  ],
  collections: [
    {id: 'owner', label: 'Owner', value: 'owner', sortOn: 'owner', renderer: coll => <OwnerChip ownerType={coll.owner_type} owner={coll.owner} />},
    {id: 'id', label: 'ID', value: 'short_code', sortOn: 'mnemonic'},
    {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
    {id: 'collectionType', label: 'Type', value: 'collection_type', sortOn: 'collection_type'},
    {id: 'full_name', label: 'Full Name', value: 'full_name', sortOn: 'full_name'},
    {id: 'uuid', label: 'UUID', value: 'uuid', sortable: false},
    {id: 'description', label: 'Description', value: 'description', sortable: false},
    {id: 'public_access', label: 'Public Access', value: 'public_access', sortable: false},
    {id: 'default_locale', label: 'Default Locale', value: 'default_locale', sortable: false},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'external_id', label: 'External ID', value: 'external_id', sortable: false},
    {id: 'canonical_url', label: 'Canonical URL', value: 'canonical_url', sortable: false, formatter: formatWebsiteLink},
    {id: 'publisher', label: 'Publisher', value: 'publisher', sortable: false},
    {id: 'purpose', label: 'Purpose', value: 'purpose', sortable: false},
    {id: 'copyright', label: 'Copyright', value: 'copyright', sortable: false},
    {id: 'revision_date', label: 'Revision Date', value: 'revision_date', sortable: false, formatter: formatDate},
  ],
  organizations: [
    {id: 'id', label: 'ID', value: 'id', sortOn: 'mnemonic', renderer: org => <OwnerChip ownerType='Organization' owner={org.id} />},
    {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
    {id: 'createdOn', label: 'Created On', value: 'created_on', formatter: formatDate, sortOn: 'created_on'},
  ],
  users: [
    {id: 'username', label: 'Username', value: 'username', sortOn: 'username', renderer: user => <OwnerChip ownerType='user' owner={user.username} />},
    {id: 'name', label: 'Name', value: 'name', sortOn: 'name'},
    {id: 'createdOn', label: 'Joined On', value: 'created_on', formatter: formatDate, sortOn: 'date_joined'},
    {id: 'email', label: 'Email', value: 'email', sortable: false},
    {id: 'company', label: 'Company', value: 'company'},
    {id: 'location', label: 'Location', value: 'location'},
    {id: 'website', label: 'Website', value: 'website', sortable: false, formatter: formatWebsiteLink},
    {id: 'last_login', label: 'Last Login', value: 'last_login', sortable: false, formatter: formatDateTime},
  ],
  references: [
    {id: 'expression', label: 'Reference', value: 'expression', sortable: false, renderer: reference => <ReferenceChip {...reference} />},
  ]
};
