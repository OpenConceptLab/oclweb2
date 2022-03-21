import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  List as ListIcon,
} from '@mui/icons-material';
import { Collapse } from '@mui/material';
import { isEmpty, map, filter, get } from 'lodash';
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
import SupportedLocales from '../common/SupportedLocales';
import SourceForm from './SourceForm';
import ConceptContainerDelete from '../common/ConceptContainerDelete';
import CollapsibleDivider from '../common/CollapsibleDivider';
import { SOURCE_DEFAULT_CONFIG } from '../../common/defaultConfigs';

const DEFAULT_VISIBLE_ATTRIBUTES = SOURCE_DEFAULT_CONFIG.config.header.visibleAttributes
const DEFAULT_INVISIBLE_ATTRIBUTES = SOURCE_DEFAULT_CONFIG.config.header.invisibleAttributes

const SourceHomeHeader = ({
  source, isVersionedObject, versionedObjectURL, config, shrink
}) => {
  const hasAccess = currentUserHasAccess();
  const [openHeader, setOpenHeader] = React.useState(!get(config, 'config.header.shrink', false));
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [logoURL, setLogoURL] = React.useState(source.logo_url)
  const [sourceForm, setSourceForm] = React.useState(false);
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
  const getVisibleAttributes = ()=>{
    if (get(config, 'config.header.visibleAttributes') === 'object'){
      return get(config, 'config.header.visibleAttributes')
    }
    else if (get(config, 'config.header.visibleAttributes')) {
      return DEFAULT_VISIBLE_ATTRIBUTES
    }
    else return []
  }
  const getHiddenAttributes = () => {
    if (get(config, 'config.header.invisibleAttributes') === 'object')
      return {...get(config, 'config.header.invisibleAttributes'), ...getDefaultHiddenAttributes()}
    else if (get(config, 'config.header.invisibleAttributes'))
      return { DEFAULT_INVISIBLE_ATTRIBUTES, ...getDefaultHiddenAttributes() }
    else return []
  }
  const hasManyHiddenAttributes = nonEmptyCount(source, map(getHiddenAttributes(),(attr) => attr.value)) >= 4;


  React.useEffect(
    () => setOpenHeader(!get(config, 'config.header.shrink', false)),
    [get(config, 'config.header.shrink')]
  )

  React.useEffect(
    () => setOpenHeader(!shrink),
    [shrink]
  )

  const deleteSource = () => {
    APIService.new().overrideURL(source.url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Source Deleted', 1, () => window.location.hash = source.owner_url)
      else if(get(response, 'status') === 202)
        alertifyjs.success('Source Delete Accepted. This may take few minutes.')
      else if(get(response, 'status') === 400)
        alertifyjs.error(get(response, 'data.detail', 'Source Delete Failed'))
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  return (
    <header className='home-header col-xs-12 no-side-padding' style={{backgroundColor: WHITE}}>
      <div className='col-xs-12 no-side-padding container'>
        <div className='col-xs-1 home-icon' style={{textAlign: 'left', paddingRight: '0px'}}>
          <HeaderLogo
            logoURL={logoURL}
            onUpload={onLogoUpload}
            defaultIcon={<ListIcon className='default-svg' />}
          />
        </div>
        <div className='col-xs-11'>
          <div className='col-xs-12 no-side-padding flex-vertical-center home-resource-full-name' style={{paddingTop: '0px'}}>
            <span style={{marginRight: '10px'}}>
              {source.full_name}
            </span>
            <AccessChip publicAccess={source.public_access} />
          </div>
          <Collapse in={openHeader} className='col-xs-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              source.description &&
              <div className='col-xs-12 no-side-padding flex-vertical-center resource-description'>
                {source.description}
              </div>
            }
            {
              map(getVisibleAttributes(), (attr, index) => {
                if (attr.value === "supported_locales" || attr.value === "default_locale")
                  return <HeaderAttribute key={attr.label + index} label="Supported Locales" value={<SupportedLocales {...source} />} gridClass="col-xs-12" type="component" />;
                return <HeaderAttribute key={attr.label + index} label={attr.label} value={source[attr.value]} type={attr.type} gridClass="col-xs-12"/>;
              })
            }
            <HeaderAttribute label="Custom Attributes" value={!isEmpty(source.extras) && <CustomAttributesPopup attributes={source.extras} />} gridClass="col-xs-12" />
            {
              hasManyHiddenAttributes ?
              <div className='col-xs-12 no-side-padding'>
                <CollapsibleAttributes
                  object={source}
                  hiddenAttributes={getHiddenAttributes()}
                />
              </div> :
              <React.Fragment>
                {
                  map(getHiddenAttributes(), (attr, index) => (
                    <HeaderAttribute key={attr.label + index} label={attr.label} value={get(source, attr.value)} gridClass="col-xs-12" type={attr.type} />
                  ))
                }
              </React.Fragment>
            }
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
              {
                source.website &&
                <span style={{marginRight: '10px'}}>
                  <LinkLabel link={source.website} iconSize='medium' noContainerClass />
                </span>
              }
              <span>
                <LastUpdatedOnLabel
                  date={source.updated_on}
                  by={source.updated_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              <span style={{marginLeft: '10px'}}>
                <LastUpdatedOnLabel
                  label='Created'
                  date={source.created_on}
                  by={source.created_by}
                  iconSize='medium'
                  noContainerClass
                />
              </span>
              {
                source.external_id &&
                <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                  <ExternalIdLabel externalId={source.external_id} iconSize='medium' />
                </span>
              }
            </div>
          </Collapse>
        </div>
        <CollapsibleDivider open={openHeader} onClick={() => setOpenHeader(!openHeader)} light />
      </div>
      <CommonFormDrawer
        style={{zIndex: 1202}}
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          isVersionedObject &&
                       <SourceForm edit reloadOnSuccess onCancel={() => setSourceForm(false)} source={source} parentURL={versionedObjectURL} />
        }
      />
      {
        isVersionedObject && hasAccess && !isEmpty(source) &&
        <ConceptContainerDelete open={deleteDialog} resource={source} onClose={() => setDeleteDialog(false)} onDelete={() => deleteSource() } />
      }
    </header>
  )
}

export default SourceHomeHeader;
