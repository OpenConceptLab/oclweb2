import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  List as ListIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { Tooltip, IconButton, ButtonGroup, Button } from '@material-ui/core';
import { includes, isEmpty, keys, map, startCase, get } from 'lodash';
import { toFullAPIURL, copyURL, nonEmptyCount, currentUserHasAccess } from '../../common/utils';
import { GREEN } from '../../common/constants';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import VersionButton from '../common/VersionButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import LinkLabel from '../common/LinkLabel';
import PublicAccessChip from '../common/PublicAccessChip';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import CollapsibleAttributes from '../common/CollapsibleAttributes';
import HeaderAttribute from '../common/HeaderAttribute';
import HeaderLogo from '../common/HeaderLogo';
import CommonFormDrawer from '../common/CommonFormDrawer';
import SupportedLocales from '../common/SupportedLocales';
import DownloadButton from '../common/DownloadButton';
import SourceForm from './SourceForm';

const HIDDEN_ATTRIBUTES = {
  canonical_url: 'url',
  publisher: 'text',
  purpose: 'text',
  copyright: 'text',
  content_type: 'text',
  revision_date: 'date',
  identifier: 'json',
  contact: 'json',
  jurisdiction: 'json'
}
const SourceHomeHeader = ({
  source, isVersionedObject, versionedObjectURL, currentURL
}) => {
  const downloadFileName = isVersionedObject ? `${source.type}-${source.short_code}` : `${source.type}-${source.short_code}-${source.id}`;
  const hasAccess = currentUserHasAccess();
  const [logoURL, setLogoURL] = React.useState(source.logo_url)
  const [sourceForm, setSourceForm] = React.useState(false);
  const isRetired = source.isRetired;
  const onIconClick = () => copyURL(toFullAPIURL(currentURL))
  const hasManyHiddenAttributes = nonEmptyCount(source, keys(HIDDEN_ATTRIBUTES)) >= 4;
  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(versionedObjectURL).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }

  const deleteSource = () => {
    APIService.new().overrideURL(source.url).delete().then(response => {
      if(get(response, 'status') === 204)
        alertifyjs.success('Source Deleted', 1, () => window.location.hash = source.owner_url)
      else
        alertifyjs.error('Something bad happened!')
    })
  }

  const onDelete = () => {
    const title = `Delete Source : ${source.short_code}`;
    const message = `Are you sure you want to permanently delete this source ${source.short_code}? This action cannot be undone! This action cannot be undone! This will delete the entire source and all of its associated versions, concepts and mappings.`
    const confirm = alertifyjs.confirm()
    confirm.setHeader(title);
    confirm.setMessage(message);
    confirm.set('onok', deleteSource);
    confirm.show();
  }

  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <HeaderLogo
            logoURL={logoURL}
            onUpload={onLogoUpload}
            defaultIcon={<ListIcon className='default-svg' />}
          />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...source} href={versionedObjectURL} />
            <span className='separator'>/</span>
            <SourceButton label={source.short_code} href={`#${versionedObjectURL}`} />
            {
              !isVersionedObject &&
              <React.Fragment>
                <span className='separator'>/</span>
                <VersionButton
                  label={source.version} retired={isRetired} href={`#${currentURL}`}
                  bgColor={GREEN}
                />
              </React.Fragment>
            }
            {
              hasAccess && isVersionedObject &&
              <span style={{marginLeft: '15px'}}>
                <ButtonGroup variant='text' size='large'>
                  <Tooltip title='Edit Source'>
                    <Button onClick={() => setSourceForm(true)}>
                      <EditIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                  <Tooltip title='Delete Source'>
                    <Button onClick={onDelete}>
                      <DeleteIcon fontSize='inherit' />
                    </Button>
                  </Tooltip>
                  <DownloadButton resource={source} filename={downloadFileName} includeCSV />
                </ButtonGroup>
              </span>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}} className={isRetired ? 'retired': ''}>
              {source.full_name}
            </span>
            {
              includes(['view', 'edit'], source.public_access.toLowerCase()) &&
              <PublicAccessChip publicAccess={source.public_access} />
            }
            <span style={{marginLeft: '10px'}}>
              <Tooltip title="Copy URL" placement="right">
                <IconButton onClick={onIconClick} color="primary">
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </span>
          </div>
          {
            source.description &&
            <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
              {source.description}
            </div>
          }
          <HeaderAttribute label="Source Type" value={source.source_type} gridClass="col-md-12" />
          <HeaderAttribute label="Supported Locales" value={<SupportedLocales {...source} />} gridClass="col-md-12" type="component" />
          <HeaderAttribute label="Custom Validation Schema" value={source.custom_validation_schema} gridClass="col-md-12" />
          <HeaderAttribute label="Custom Attributes" value={!isEmpty(source.extras) && <CustomAttributesPopup attributes={source.extras} />} gridClass="col-md-12" />
          {
            hasManyHiddenAttributes ?
            <div className='col-md-12 no-side-padding'>
              <CollapsibleAttributes
                object={source}
                urlAttrs={['canonical_url']}
                textAttrs={['publisher', 'purpose', 'copyright', 'content_type']}
                dateAttrs={['revision_date']}
                jsonAttrs={['identifier', 'contact', 'jurisdiction']}
              />
            </div> :
            <React.Fragment>
              {
                map(HIDDEN_ATTRIBUTES, (type, attr) => (
                  <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(source, attr)} gridClass="col-md-12" type={type} />
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
        </div>
      </div>
      <CommonFormDrawer
        isOpen={sourceForm}
        onClose={() => setSourceForm(false)}
        formComponent={
          isVersionedObject &&
                       <SourceForm edit reloadOnSuccess onCancel={() => setSourceForm(false)} source={source} parentURL={versionedObjectURL} />
        }
      />
    </header>
  )
}

export default SourceHomeHeader;
