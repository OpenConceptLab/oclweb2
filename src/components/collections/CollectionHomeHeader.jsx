import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Loyalty as LoyaltyIcon,
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { filter, map, get } from 'lodash';
import { nonEmptyCount, currentUserHasAccess } from '../../common/utils';
import { WHITE } from '../../common/constants';
import APIService from '../../services/APIService';
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
import ConceptContainerDelete from '../common/ConceptContainerDelete';
import CollapsibleDivider from '../common/CollapsibleDivider';
import { COLLECTION_DEFAULT_CONFIG } from '../../common/defaultConfigs';

const DEFAULT_VISIBLE_ATTRIBUTES = COLLECTION_DEFAULT_CONFIG.config.header.visibleAttributes
const DEFAULT_INVISIBLE_ATTRIBUTES = COLLECTION_DEFAULT_CONFIG.config.header.invisibleAttributes

const CollectionHomeHeader = ({
  collection, isVersionedObject, versionedObjectURL, config, tab
}) => {
  const tabConfig = get(config, `config.tabs.${tab}`);
  const hasAccess = currentUserHasAccess();
  const isExpandedHeader = () => !get(config, 'config.header.shrink', false) && get(tabConfig, 'type') !== 'versions';
  const [openHeader, setOpenHeader] = React.useState(isExpandedHeader);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [logoURL, setLogoURL] = React.useState(collection.logo_url)
  const [collectionForm, setCollectionForm] = React.useState(false);
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
      else if(get(response, 'status') === 202)
        alertifyjs.success('Collection Delete Accepted. This may take few minutes.')
      else if(get(response, 'status') === 400)
        alertifyjs.error(get(response, 'data.detail', 'Collection Delete Failed'))
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  return (
    <header className='home-header col-xs-12 no-side-padding' style={{backgroundColor: WHITE}}>
      <div className='col-xs-12 no-side-padding container'>
        <div className='col-xs-12 no-side-padding' style={openHeader ? {} : {display: 'flex', alignItems: 'center'}}>
          <div className='col-xs-1 home-icon' style={{textAlign: 'left', paddingRight: '0px'}}>
            <HeaderLogo
              logoURL={logoURL}
              onUpload={onLogoUpload}
              defaultIcon={<LoyaltyIcon className='default-svg' />}
              shrink={!openHeader}
            />
          </div>
          <div className='col-xs-11' style={{marginBottom: '5px'}}>
            <div className='col-xs-12 no-side-padding home-resource-full-name' style={{paddingTop: '0px', display: 'block'}}>
              <span style={{marginRight: '5px'}}>
                {collection.full_name}
              </span>
              <AccessChip publicAccess={collection.public_access} />
            </div>
          </div>
        </div>
        <div className='col-xs-1 home-icon' style={{textAlign: 'left', paddingRight: '0px'}} />
        <div className='col-xs-11' style={openHeader ? {marginTop: '-30px'} : {}}>
          <Collapse in={openHeader} className='col-xs-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              collection.description &&
                <div className='col-xs-12 no-side-padding flex-vertical-center resource-description'>
                  {collection.description}
                </div>
            }
            {
              map(getVisibleAttributes(), (attr, index) => {
                if (attr.value === "supported_locales" || attr.value === "default_locale")
                  return <HeaderAttribute key={attr.label + index} label="Supported Locales" value={<SupportedLocales {...collection} />} gridClass="col-xs-12" type="component" />;
                return <HeaderAttribute key={attr.label + index} label={attr.label} value={collection[attr.value]} type={attr.type} gridClass="col-xs-12"/>;
              })
            }
            <HeaderAttribute label="Custom Attributes" value={<CustomAttributesPopup attributes={collection.extras} />} gridClass="col-xs-12" />
            {
              hasManyHiddenAttributes ?
                <div className='col-xs-12 no-side-padding'>
                  <CollapsibleAttributes
                    hiddenAttributes={getHiddenAttributes()}
                    object={collection}
                  />
                </div> :
              <React.Fragment>
                {
                  map(getHiddenAttributes(), (attr, index) => (
                    <HeaderAttribute key={attr.label + index} label={attr.label} value={get(collection, attr.value)} gridClass="col-xs-12" type={attr.type} />
                  ))
                }
              </React.Fragment>
            }
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
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
        style={{zIndex: 1202}}
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
