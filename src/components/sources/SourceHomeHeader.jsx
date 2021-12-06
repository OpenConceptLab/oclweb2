import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  List as ListIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Tooltip, ButtonGroup, Button, Collapse } from '@mui/material';
import { isEmpty, map, filter, get } from 'lodash';
import { toFullAPIURL, copyURL, nonEmptyCount, currentUserHasAccess } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
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
import DownloadButton from '../common/DownloadButton';
import SourceForm from './SourceForm';
import ReleasedChip from '../common/ReleasedChip';
import RetiredChip from '../common/RetiredChip';
import ProcessingChip from '../common/ProcessingChip';
import ConceptContainerDelete from '../common/ConceptContainerDelete';
import CollapsibleDivider from '../common/CollapsibleDivider';
import { SOURCE_DEFAULT_CONFIG } from '../../common/defaultConfigs';
import VersionSelectorButton from '../common/VersionSelectorButton';

const DEFAULT_VISIBLE_ATTRIBUTES = SOURCE_DEFAULT_CONFIG.config.header.visibleAttributes
const DEFAULT_INVISIBLE_ATTRIBUTES = SOURCE_DEFAULT_CONFIG.config.header.invisibleAttributes

const SourceHomeHeader = ({
  source, isVersionedObject, versionedObjectURL, currentURL, config, splitView, versions
}) => {
  const downloadFileName = isVersionedObject ? `${source.type}-${source.short_code}` : `${source.type}-${source.short_code}-${source.id}`;
  const hasAccess = currentUserHasAccess();
  const [openHeader, setOpenHeader] = React.useState(!get(config, 'config.header.shrink', false));
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const [logoURL, setLogoURL] = React.useState(source.logo_url)
  const [sourceForm, setSourceForm] = React.useState(false);
  const onIconClick = () => copyURL(toFullAPIURL(currentURL))
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
    if (get(config, 'config.header.invisibleAttributes') === 'object'){
      return {...get(config, 'config.header.invisibleAttributes'), ...getDefaultHiddenAttributes()}
    }
    else if (get(config, 'config.header.invisibleAttributes')) {
      return { DEFAULT_INVISIBLE_ATTRIBUTES, ...getDefaultHiddenAttributes() } 
    }
    else return []
  }
  const hasManyHiddenAttributes = nonEmptyCount(source, map(getHiddenAttributes(),(attr) => attr.value)) >= 4;


  React.useEffect(
    () => setOpenHeader(!get(config, 'config.header.shrink', false)),
    [get(config, 'config.header.shrink')]
  )

  React.useEffect(() => {
    if(splitView)
      setOpenHeader(false)
  }, [splitView])

  const deleteSource = () => {
    APIService.new().overrideURL(source.url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Source Deleted', 1, () => window.location.hash = source.owner_url)
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
            defaultIcon={<ListIcon className='default-svg' />}
            shrink={!openHeader}
          />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...source} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={source.short_code} href={`#${versionedObjectURL}`} />
            <React.Fragment>
              <span className='separator'>/</span>
              <VersionSelectorButton selected={source} versions={versions} resource='source' />
            </React.Fragment>
            {
              source.retired &&
              <span style={{marginLeft: '10px'}}>
                <RetiredChip size='small' />
              </span>
            }
            {
              source.released &&
              <span style={{marginLeft: '10px'}}>
                <ReleasedChip size='small' />
              </span>
            }
            {
              source.is_processing &&
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
                  <Tooltip arrow title='Edit Source'>
                    <Button onClick={() => setSourceForm(true)} color='secondary'>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                {
                  hasAccess && isVersionedObject &&
                  <Tooltip arrow title='Delete Source'>
                    <Button onClick={() => setDeleteDialog(true) } color='secondary'>
                      <DeleteIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                }
                <DownloadButton resource={source} filename={downloadFileName} includeCSV />
              </ButtonGroup>
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}}>
              {source.full_name}
            </span>
            <AccessChip publicAccess={source.public_access} />
          </div>
          <Collapse in={openHeader} className='col-md-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              source.description &&
              <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
                {source.description}
              </div>
            }
            {
              map(getVisibleAttributes(), (attr, index) => {
                if (attr.value === "supported_locales" || attr.value === "default_locale")
                  return <HeaderAttribute key={attr.label + index} label="Supported Locales" value={<SupportedLocales {...source} />} gridClass="col-md-12" type="component" />;
                return <HeaderAttribute key={attr.label + index} label={attr.label} value={source[attr.value]} type={attr.type} gridClass="col-md-12"/>;
              })
            }
            <HeaderAttribute label="Custom Attributes" value={!isEmpty(source.extras) && <CustomAttributesPopup attributes={source.extras} />} gridClass="col-md-12" />
            {
              hasManyHiddenAttributes ?
              <div className='col-md-12 no-side-padding'>
                <CollapsibleAttributes
                  object={source}
                  hiddenAttributes={getHiddenAttributes()}
                />
              </div> :
              <React.Fragment>
                {
                  map(getHiddenAttributes(), (attr, index) => (
                    <HeaderAttribute key={attr.label + index} label={attr.label} value={get(source, attr.value)} gridClass="col-md-12" type={attr.type} />
                  ))
                }
              </React.Fragment>
            }
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
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
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          isVersionedObject &&
                       <SourceForm edit reloadOnSuccess onCancel={() => setSourceForm(false)} source={source} parentURL={versionedObjectURL} />
        }
      />
      {
        isVersionedObject && hasAccess && source &&
        <ConceptContainerDelete open={deleteDialog} resource={source} onClose={() => setDeleteDialog(false)} onDelete={() => deleteSource() } />
      }
    </header>
  )
}

export default SourceHomeHeader;
