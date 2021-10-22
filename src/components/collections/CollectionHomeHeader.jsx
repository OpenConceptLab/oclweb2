import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Loyalty as LoyaltyIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { Tooltip, Button, ButtonGroup, Collapse } from '@material-ui/core';
import { keys, map, startCase, get, isEmpty } from 'lodash';
import { toFullAPIURL, copyURL, nonEmptyCount, currentUserHasAccess } from '../../common/utils';
import { GREEN } from '../../common/constants';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import CollectionButton from '../common/CollectionButton';
import VersionButton from '../common/VersionButton';
import ExpansionButton from '../common/ExpansionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import LinkLabel from '../common/LinkLabel';
import AccessChip from '../common/AccessChip';
import ExpansionChip from '../common/ExpansionChip';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';
import HeaderLogo from '../common/HeaderLogo';
import CommonFormDrawer from '../common/CommonFormDrawer';
import CollectionForm from './CollectionForm';
import SupportedLocales from '../common/SupportedLocales';
import DownloadButton from '../common/DownloadButton';
import ReleasedChip from '../common/ReleasedChip';
import RetiredChip from '../common/RetiredChip';
import ProcessingChip from '../common/ProcessingChip';
import ConceptContainerDelete from '../common/ConceptContainerDelete';
import CollapsibleDivider from '../common/CollapsibleDivider';

const HIDDEN_ATTRIBUTES = {
  canonical_url: 'url',
  publisher: 'text',
  purpose: 'text',
  copyright: 'text',
  preferred_source: 'text',
  custom_resources_linked_source: 'text',
  revision_date: 'date',
  identifier: 'json',
  contact: 'json',
  jurisdiction: 'json',
  meta: 'json',
  immutable: 'boolean',
  locked_date: 'date',
  experimental: 'boolean'
}
const CollectionHomeHeader = ({
  collection, isVersionedObject, versionedObjectURL, currentURL, config, expansion
}) => {
  const downloadFileName = isVersionedObject ? `${collection.type}-${collection.short_code}` : `${collection.type}-${collection.short_code}-${collection.id}`;
  const hasAccess = currentUserHasAccess();
  const [openHeader, setOpenHeader] = React.useState(!get(config, 'config.shrinkHeader', false));
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [logoURL, setLogoURL] = React.useState(collection.logo_url)
  const [collectionForm, setCollectionForm] = React.useState(false);
  const onIconClick = () => copyURL(toFullAPIURL(get(expansion, 'url') || currentURL))
  const hasManyHiddenAttributes = nonEmptyCount(collection, keys(HIDDEN_ATTRIBUTES)) >= 4;
  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(versionedObjectURL).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }

  React.useEffect(
    () => setOpenHeader(!get(config, 'config.shrinkHeader', false)),
    [get(config, 'config.shrinkHeader')]
  )

  const deleteCollection = () => {
    APIService.new().overrideURL(collection.url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Collection Deleted', 1, () => window.location.hash = collection.owner_url)
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <HeaderLogo
            logoURL={logoURL}
            onUpload={onLogoUpload}
            defaultIcon={<LoyaltyIcon className='default-svg' />}
            shrink={!openHeader}
          />
        </div>
        <div className='col-md-11' style={{marginBottom: '5px'}}>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...collection} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <CollectionButton label={collection.short_code} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>
                <VersionButton label={collection.version} href={`#${currentURL}`} bgColor={GREEN} />
              </React.Fragment>
            }
            {
              !isEmpty(expansion) &&
              <React.Fragment>
                <span className='separator'>/</span>
                <ExpansionButton label={expansion.mnemonic} href={`#${expansion.url}`} bgColor={GREEN} />
              </React.Fragment>
            }
            {
              collection.retired &&
              <span style={{marginLeft: '10px'}}>
                <RetiredChip size='small' />
              </span>
            }
            {
              collection.released &&
              <span style={{marginLeft: '10px'}}>
                <ReleasedChip size='small' />
              </span>
            }
            {
              collection.is_processing &&
              <span style={{marginLeft: '10px'}}>
                <ProcessingChip size='small' />
              </span>
            }
            <span style={{marginLeft: '15px'}}>
              <ButtonGroup variant='text' size='large'>
                <Tooltip arrow title="Copy URL">
                  <Button onClick={onIconClick}>
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Edit Collection'>
                    <Button onClick={() => setCollectionForm(true)}>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Delete Collection'>
                    <Button onClick={() => setDeleteDialog(true) }>
                      <DeleteIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                <DownloadButton resource={collection} filename={downloadFileName} includeCSV />
              </ButtonGroup>
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}}>
              {collection.full_name}
            </span>
            <AccessChip publicAccess={collection.public_access} />
            <span style={{marginLeft: '5px', marginTop: '-5px'}}>
              <ExpansionChip expanded={isVersionedObject ? collection.autoexpand_head : collection.expanded} />
            </span>
          </div>
          <Collapse in={openHeader} className='col-md-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              collection.description &&
              <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
                {collection.description}
              </div>
            }
            <HeaderAttribute label="Short Code" value={collection.short_code} gridClass="col-md-12" />
            <HeaderAttribute label="Name" value={collection.name} gridClass="col-md-12" />
            <HeaderAttribute label="Collection Type" value={collection.collection_type} gridClass="col-md-12" />
            <HeaderAttribute label="Supported Locales" value={<SupportedLocales {...collection} />} gridClass="col-md-12" type="component" />
            <HeaderAttribute label="Custom Validation Schema" value={collection.custom_validation_schema} gridClass="col-md-12" />
            <HeaderAttribute label="Custom Attributes" value={<CustomAttributesPopup attributes={collection.extras} />} gridClass="col-md-12" />
            {
              hasManyHiddenAttributes ?
              <div className='col-md-12 no-side-padding'>
                <CollapsibleAttributes
                  object={collection}
                  urlAttrs={['canonical_url']}
                  textAttrs={['publisher', 'purpose', 'copyright', 'preferred_source', 'custom_resources_linked_source']}
                  dateAttrs={['revision_date', 'locked_date']}
                  jsonAttrs={['identifier', 'contact', 'jurisdiction']}
                  booleanAttrs={['immutable', 'experimental']}
                />
              </div> :
              <React.Fragment>
                {
                  map(HIDDEN_ATTRIBUTES, (type, attr) => (
                    <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(collection, attr)} gridClass="col-md-12" type={type} />
                  ))
                }
              </React.Fragment>
            }
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
              {
                collection.website &&
                <span>
                  <LinkLabel link={collection.website} iconSize='medium' noContainerClass />
                </span>
              }
              <span>
                <LastUpdatedOnLabel
                  date={collection.updated_on}
                  by={collection.updated_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              <span style={{marginLeft: '10px'}}>
                <LastUpdatedOnLabel
                  label='Created'
                  date={collection.created_on}
                  by={collection.created_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              {
                collection.external_id &&
                <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                  <ExternalIdLabel externalId={collection.external_id} iconSize='medium' />
                </span>
              }
            </div>
          </Collapse>
        </div>
        <CollapsibleDivider open={openHeader} onClick={() => setOpenHeader(!openHeader)} light />
      </div>
      <CommonFormDrawer
        isOpen={collectionForm}
        onClose={() => setCollectionForm(false)}
        formComponent={
          isVersionedObject &&
                       <CollectionForm edit reloadOnSuccess onCancel={() => setCollectionForm(false)} collection={collection} parentURL={versionedObjectURL} />
        }
      />
      {
        isVersionedObject && hasAccess && collection &&
        <ConceptContainerDelete open={deleteDialog} resource={collection} onClose={() => setDeleteDialog(false)} onDelete={() => deleteCollection() } />
      }
    </header>
  )
}

export default CollectionHomeHeader;
