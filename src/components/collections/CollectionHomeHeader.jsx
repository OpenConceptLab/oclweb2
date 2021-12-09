import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Loyalty as LoyaltyIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Tooltip, Button, ButtonGroup, Collapse } from '@mui/material';
import { filter, map, get, isEmpty } from 'lodash';
import { toFullAPIURL, copyURL, nonEmptyCount, currentUserHasAccess } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import CollectionButton from '../common/CollectionButton';
import VersionSelectorButton from '../common/VersionSelectorButton';
import ExpansionSelectorButton from '../common/ExpansionSelectorButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import LinkLabel from '../common/LinkLabel';
import AccessChip from '../common/AccessChip';
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
import { COLLECTION_DEFAULT_CONFIG } from '../../common/defaultConfigs';

const DEFAULT_VISIBLE_ATTRIBUTES = COLLECTION_DEFAULT_CONFIG.config.header.visibleAttributes
const DEFAULT_INVISIBLE_ATTRIBUTES = COLLECTION_DEFAULT_CONFIG.config.header.invisibleAttributes

const CollectionHomeHeader = ({
  collection, isVersionedObject, versionedObjectURL, currentURL, config, expansion, tab, versions,
  expansions, isLoadingExpansions
}) => {
  const downloadFileName = isVersionedObject ? `${collection.type}-${collection.short_code}` : `${collection.type}-${collection.short_code}-${collection.id}`;
  const tabConfig = get(config, `config.tabs.${tab}`);
  const hasAccess = currentUserHasAccess();
  const isExpandedHeader = () => !get(config, 'config.header.shrink', false) && tabConfig.type !== 'versions';
  const [openHeader, setOpenHeader] = React.useState(isExpandedHeader);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [logoURL, setLogoURL] = React.useState(collection.logo_url)
  const [collectionForm, setCollectionForm] = React.useState(false);
  const onIconClick = () => copyURL(toFullAPIURL(get(expansion, 'url') || currentURL))
  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(versionedObjectURL).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }
  const getDefaultHiddenAttributes = () => {
    return filter(DEFAULT_VISIBLE_ATTRIBUTES, (attr) => {
      return !map(get(config, 'config.header.visibleAttributes'),(attr) => attr.value).includes(attr.value)
    }
    )
  }
  const getHiddenAttributes = () => {
    if (get(config, 'config.header.invisibleAttributes') === 'object'){
      return {...get(config, 'config.header.invisibleAttributes'), ...getDefaultHiddenAttributes()}
    }
    else if (get(config, 'config.header.invisibleAttributes')) {
      return { DEFAULT_INVISIBLE_ATTRIBUTES, ...getDefaultHiddenAttributes() }
    }
    else return []
  }
  const getVisibleAttributes = ()=>{
    if (get(config, 'config.header.visibleAttributes') === 'object'){
      return get(config, 'config.header.visibleAttributes')
    }
    else if (get(config, 'config.header.visibleAttributes')) {
      return DEFAULT_VISIBLE_ATTRIBUTES
    }
    else return []
  }
  const hasManyHiddenAttributes = nonEmptyCount(collection, map(getHiddenAttributes(),(attr) => attr.value)) >= 4;


  React.useEffect(
    () => setOpenHeader(isExpandedHeader()),
    [get(config, 'config.header.shrink')]
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
            <React.Fragment>
              <span className='separator'>/</span>
              <VersionSelectorButton
                selected={collection}
                versions={versions}
                resource='collection'
              />
            </React.Fragment>
            {
              !isEmpty(expansions) && !isLoadingExpansions &&
              <React.Fragment>
                <span className='separator'>/</span>
                <ExpansionSelectorButton
                  selected={expansion}
                  expansions={expansions}
                  version={collection}
                />
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
                  <Button onClick={onIconClick} color='secondary'>
                    <CopyIcon fontSize="inherit" />
                  </Button>
                </Tooltip>
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Edit Collection'>
                    <Button onClick={() => setCollectionForm(true)} color='secondary'>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Delete Collection'>
                    <Button onClick={() => setDeleteDialog(true) } color='secondary'>
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
          </div>
          <Collapse in={openHeader} className='col-md-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              collection.description &&
              <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
                {collection.description}
              </div>
            }
            {
              map(getVisibleAttributes(), (attr, index) => {
                if (attr.value === "supported_locales" || attr.value === "default_locale")
                  return <HeaderAttribute key={attr.label + index} label="Supported Locales" value={<SupportedLocales {...collection} />} gridClass="col-md-12" type="component" />;
                return <HeaderAttribute key={attr.label + index} label={attr.label} value={collection[attr.value]} type={attr.type} gridClass="col-md-12"/>;
              })
            }
            <HeaderAttribute label="Custom Attributes" value={<CustomAttributesPopup attributes={collection.extras} />} gridClass="col-md-12" />
            {
              hasManyHiddenAttributes ?
              <div className='col-md-12 no-side-padding'>
                <CollapsibleAttributes
                  hiddenAttributes={getHiddenAttributes()}
                  object={collection}
                />
              </div> :
              <React.Fragment>
                {
                  map(getHiddenAttributes(), (attr, index) => (
                    <HeaderAttribute key={attr.label + index} label={attr.label} value={get(collection, attr.value)} gridClass="col-md-12" type={attr.type} />
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
