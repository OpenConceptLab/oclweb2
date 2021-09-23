import React from 'react';
import {
  Home as HomeIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
} from '@material-ui/icons';
import { Tooltip, ButtonGroup, Button, Collapse } from '@material-ui/core';
import { isEmpty, get, map } from 'lodash';
import { toFullAPIURL, copyURL, currentUserHasAccess } from '../../common/utils';
import APIService from '../../services/APIService';
import OwnerButton from '../common/OwnerButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import LocationLabel from '../common/LocationLabel';
import LinkLabel from '../common/LinkLabel';
import CustomAttributesPopup from '../common/CustomAttributesPopup';
import AccessChip from '../common/AccessChip';
import HeaderAttribute from '../common/HeaderAttribute';
import HeaderLogo from '../common/HeaderLogo';
import CommonFormDrawer from '../common/CommonFormDrawer';
import DownloadButton from '../common/DownloadButton';
import CollapsibleDivider from '../common/CollapsibleDivider';
import OrgForm from './OrgForm';
import { ORG_DEFAULT_CONFIG } from "../../common/defaultConfigs"

const DEFAULT_VISIBLE_ATTRIBUTES = ORG_DEFAULT_CONFIG.config.header.attributes

const OrgHomeHeader = ({ org, url, fhir, extraComponents, config }) => {
  const downloadFileName = `Org-${get(org, 'id')}`;
  const [openHeader, setOpenHeader] = React.useState(!get(config, 'config.header.shrink', false));
  const [logoURL, setLogoURL] = React.useState(org.logo_url)
  const [orgForm, setOrgForm] = React.useState(false);
  const hasAccess = currentUserHasAccess();
  const onIconClick = () => copyURL(toFullAPIURL(url));

  React.useEffect(
    () => setOpenHeader(!get(config, 'config.header.shrink', false)),
    [get(config, 'config.header.shrink')]
  )

  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(url).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }

  const getVisibleAttributes = ()=>{
    if (typeof get(config, 'config.header.attributes') === 'object') {
      return get(config, 'config.header.attributes')
    }
    else if (get(config, 'config.header.attributes')) {
      return DEFAULT_VISIBLE_ATTRIBUTES
    }
    else return []
  }

  return (
    <header className='home-header col-md-12' style={{marginBottom: '0px'}}>
      <div className='col-md-12 no-side-padding container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <HeaderLogo
            logoURL={logoURL}
            onUpload={onLogoUpload}
            defaultIcon={<HomeIcon className='default-svg' />}
            shrink={!openHeader}
          />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton owner={org.id} ownerType='Organization' href={url} />
            {
              !fhir &&
              <span style={{marginLeft: '15px'}}>
                <ButtonGroup variant='text' size='large'>
                  <Tooltip arrow title="Copy URL">
                    <Button onClick={onIconClick}>
                      <CopyIcon fontSize="inherit" />
                    </Button>
                  </Tooltip>
                  {
                    hasAccess &&
                    <Tooltip arrow title='Edit Organization'>
                      <Button onClick={() => setOrgForm(true)}>
                        <EditIcon fontSize='inherit' />
                      </Button>
                    </Tooltip>
                  }
                  <DownloadButton resource={org} filename={downloadFileName} includeCSV />
                </ButtonGroup>
              </span>
            }
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center home-resource-full-name'>
            <span style={{marginRight: '10px'}}>
              {org.name}
            </span>
            {
              !fhir &&
              <AccessChip publicAccess={org.public_access} />
            }
          </div>
          <Collapse in={openHeader} className='col-md-12 no-side-padding' style={{padding: '0px', display: `${openHeader ? 'block' : 'none'}`}}>
            {
              org.description &&
              <div className='col-md-12 no-side-padding flex-vertical-center resource-description'>
                {org.description}
              </div>
            }
            {map(getVisibleAttributes(), (attr) => {
                return <HeaderAttribute key={attr.label} label={attr.label} value={org[attr.value]} type={attr.type} gridClass="col-md-12" />
            })}
            <HeaderAttribute label="Custom Attributes" value={!isEmpty(org.extras) && <CustomAttributesPopup attributes={org.extras} />} gridClass="col-md-12" />
            <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
              {
                org.location &&
                <span style={{marginRight: '10px'}}>
                  <LocationLabel location={org.location} noContainerClass iconSize="medium" />
                </span>
              }
              {
                org.website &&
                <span style={{marginRight: '10px'}}>
                  <LinkLabel link={org.website} iconSize='medium' noContainerClass />
                </span>
              }
              {
                org.created_on &&
                <span>
                  <LastUpdatedOnLabel
                    label='Created'
                    date={org.created_on}
                    by={org.created_by}
                    iconSize='medium'
                    noContainerClass
                  />
                </span>
              }
              {
                org.updated_on &&
                <span style={{marginLeft: '10px'}}>
                  <LastUpdatedOnLabel
                    date={org.updated_on}
                    by={org.updated_by}
                    iconSize='medium'
                    noContainerClass
                  />
                </span>
              }
              {
                org.external_id &&
                <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                  <ExternalIdLabel externalId={org.external_id} iconSize='medium' />
                </span>
              }
            </div>
            {extraComponents}
          </Collapse>
        </div>
        <CollapsibleDivider open={openHeader} onClick={() => setOpenHeader(!openHeader)} light />
      </div>
      <CommonFormDrawer
        isOpen={orgForm}
        onClose={() => setOrgForm(false)}
        formComponent={
          <OrgForm edit reloadOnSuccess onCancel={() => setOrgForm(false)} org={org} />
        }
      />
    </header>
  )
}

export default OrgHomeHeader;
