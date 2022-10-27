import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Home as HomeIcon,
  FileCopy as CopyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Tooltip, ButtonGroup, Button } from '@mui/material';
import { isEmpty, get, has, merge, isBoolean, map, includes } from 'lodash';
import { toFullAPIURL, copyURL, currentUserHasAccess, getCurrentUser, isAdminUser } from '../../common/utils';
import { HEADER_GRAY } from '../../common/constants';
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
import OrgForm from './OrgForm';
import HomeTabs from './HomeTabs';
import { ORG_DEFAULT_CONFIG } from "../../common/defaultConfigs"
import ConceptContainerDelete from '../common/ConceptContainerDelete';

const DEFAULT_VISIBLE_ATTRIBUTES = ORG_DEFAULT_CONFIG.config.header.attributes

const HomeHeader = ({
  org, url, fhir, extraComponents, config, ...rest
}) => {
  const downloadFileName = `Org-${get(org, 'id')}`;
  const [openHeader, setOpenHeader] = React.useState(!get(config, 'config.shrinkHeader', false));
  const [logoURL, setLogoURL] = React.useState(org.logo_url)
  const [orgForm, setOrgForm] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const hasAccess = currentUserHasAccess();
  const currentUser = getCurrentUser()
  const onIconClick = () => copyURL(toFullAPIURL(url));

  React.useEffect(
    () => setOpenHeader(!get(config, 'config.shrinkHeader', false)),
    [get(config, 'config.shrinkHeader')]
  )

  const onLogoUpload = (base64, name) => {
    APIService.new().overrideURL(url).appendToUrl('logo/')
              .post({base64: base64, name: name})
              .then(response => {
                if(get(response, 'status') === 200)
                  setLogoURL(get(response, 'data.logo_url', logoURL))
              })
  }

  const tab = rest.tab
  const selectedTabConfig = config.config.tabs[tab];
  const isExpandedHeader = tab === 0 || includes(['text', 'about'], get(selectedTabConfig, 'type'));
  const showLogo = has(config, 'config.header.logo') ?
                   config.config.header.logo : true;
  const showControls = !isExpandedHeader || has(config, 'config.header.controls') ? config.config.header.controls : true;
  const showAttributes = has(config, 'config.header.attributes') ? config.config.header.attributes : true
  const showSignatures = has(config, 'config.header.signatures') ? config.config.header.signatures : true;
  const customTitle = get(config, 'config.header.forground.title')
  const customDescription = get(config, 'config.header.forground.description')
  const forgroundTextColor = isExpandedHeader ? get(config, 'config.header.forground.color') : get(config, 'config.header.shrunkHeader.forground.color')
  const customTitleColor = isExpandedHeader ? (get(config, 'config.header.forground.titleColor') || forgroundTextColor) : get(config, 'config.header.shrunkHeader.forground.color')
  const customDescriptionColor = isExpandedHeader && (get(config, 'config.header.forground.descriptionColor') || forgroundTextColor)
  const hasBackgroundImage = Boolean(get(config, 'config.header.background.image'))
  const getBackgroundStyles = () => {
    const defaultStyles = {backgroundColor: HEADER_GRAY}
    let styles = {...defaultStyles}
    const headerBackgroundStyles = get(config, 'config.header.background')
    const backgroundColor = get(headerBackgroundStyles, 'backgroundColor')
    const image = get(headerBackgroundStyles, 'image')
    const shrunkHeaderBackgroundStyles = get(config, 'config.header.shrunkHeader.background')
    if(isExpandedHeader) {
      if(image) {
        styles['backgroundImage'] = `url(${image})`;
        styles['backgroundSize'] = 'cover';
        styles['backgroundAttachment'] = 'fixed';
      } else if(backgroundColor) {
        styles['backgroundColor'] = backgroundColor
      }
    } else {
      if(get(shrunkHeaderBackgroundStyles, 'image')) {
        styles['backgroundImage'] = `url(${shrunkHeaderBackgroundStyles['image']})`;
        styles['backgroundSize'] = 'cover';
        styles['backgroundAttachment'] = 'fixed';
      } else if (get(shrunkHeaderBackgroundStyles, 'backgroundColor'))
        styles['backgroundColor'] = shrunkHeaderBackgroundStyles['backgroundColor']
    }

    return styles
  }

  const getTitleStyles = () => customTitleColor ? {color: customTitleColor} : {}

  const getDescriptionStyles = () => {
    const style = {
      alignItems: 'start',
      width: get(config, 'config.header.forground.descriptionWidth') || '40%'
    }
    if(customDescriptionColor)
      style['color'] = customDescriptionColor

    return style;
  }

  const getVisibleAttributes = () => {
    const attributes = get(config, 'config.header.attributes')
    if(attributes)
      return isBoolean(attributes) ? DEFAULT_VISIBLE_ATTRIBUTES : attributes
  }

  const shouldShowOverlay = Boolean(isExpandedHeader && get(config, 'config.header.background.imageOverlay') && hasBackgroundImage);
  const canDelete = org.id !== 'OCL' && (isAdminUser() || (get(org, 'created_by') === get(currentUser, 'username')))
  const onDelete = () => {
    APIService.orgs(org.id).delete().then(response => {
      if(response.status === 202)
        alertifyjs.success('Organization delete is queued, this may take few minutes.', () => window.location.reload())
      else if(response.status === 204)
        alertifyjs.success('Organization is deleted', 3, () => window.location.reload())
      else if(response.status === 409)
        alertifyjs.warning('Organization delete is already in queue', 0)
      else
        alertifyjs.error('Something bad might have happened!')
    })
  }
  return (
    <header className='home-header col-xs-12' style={merge({marginBottom: tab === 0 ? 0 : '5px', padding: 0}, getBackgroundStyles())}>
      <div className='col-xs-12 no-side-padding' style={shouldShowOverlay ? {paddingBottom: '2px', backgroundColor: 'rgba(0,0,0,0.6)'} : {}}>
        <div className='col-xs-12 no-side-padding container' style={{paddingTop: '10px'}}>
          {
            showLogo &&
            <div className='no-side-padding col-xs-1 home-icon'>
              <HeaderLogo
                logoURL={logoURL}
                onUpload={onLogoUpload}
                defaultIcon={<HomeIcon className='default-svg' />}
                className={(!openHeader || !isExpandedHeader) ? 'xsmall' : ''}
              />
            </div>
          }
          <div className='col-xs-11' style={isExpandedHeader ? {minHeight: get(config, 'config.header.height') || '140px'} : {}}>
            {
              (showControls || !isExpandedHeader) &&
              <div className='col-xs-12 no-side-padding flex-vertical-center'>
                <OwnerButton owner={org.id} ownerType='Organization' href={url} />
                {
                  !fhir &&
                  <span style={{marginLeft: '15px'}}>
                    <ButtonGroup variant='text' size='large'>
                      <Tooltip arrow title="Copy URL">
                        <Button onClick={onIconClick} color='secondary'>
                          <CopyIcon fontSize="inherit" style={customTitleColor ? {color: customTitleColor} : {}} />
                        </Button>
                      </Tooltip>
                      {
                        hasAccess &&
                        <Tooltip arrow title='Edit Organization'>
                          <Button onClick={() => setOrgForm(true)} color='secondary'>
                            <EditIcon fontSize='inherit' style={customTitleColor ? {color: customTitleColor} : {}} />
                          </Button>
                        </Tooltip>
                      }
                      <DownloadButton resource={org} filename={downloadFileName} includeCSV iconStyle={customTitleColor ? {color: customTitleColor} : {}} />
                      {
                        canDelete &&
                          <Tooltip arrow title='Delete Organization'>
                            <Button onClick={() => setDeleteDialog(true)} color='secondary'>
                              <DeleteIcon fontSize='inherit' style={customTitleColor ? {color: customTitleColor} : {}} />
                            </Button>
                          </Tooltip>
                      }
                    </ButtonGroup>
                  </span>
                }
              </div>
            }
            {
              isExpandedHeader &&
              <div className='col-xs-12 no-side-padding flex-vertical-center home-resource-full-name large' style={{paddingTop: (showControls || !isExpandedHeader) ? '10px' : '0'}}>
                <span style={merge({marginRight: '10px'}, getTitleStyles())}>
                  {
                    customTitle ? (<h3 style={{margin: 0}}>{customTitle}</h3>) : org.name
                  }
                </span>
                {
                  !fhir && showAttributes &&
                  <AccessChip publicAccess={org.public_access} />
                }
              </div>
            }
            {
              (customDescription && isExpandedHeader) ?
              <div className='col-xs-12 no-side-padding header-custom-html resource-description large' dangerouslySetInnerHTML={{__html: customDescription}} style={getDescriptionStyles()} /> : (
                org.description && isExpandedHeader &&
                <div className='col-xs-12 no-side-padding flex-vertical-center resource-description large' style={getDescriptionStyles()}>
                  {org.description}
                </div>
              )
            }
            {
              showAttributes && isExpandedHeader &&
              <React.Fragment>
                {
                  map(
                    getVisibleAttributes(),
                    (attr, index) => <HeaderAttribute
                                       key={index}
                                       label={attr.label}
                                       value={org[attr.value]}
                                       type={attr.type}
                                       gridClass="col-xs-12"
                                       color={customDescriptionColor}
                    />
                  )
                }
                <HeaderAttribute label="Custom Attributes" value={!isEmpty(org.extras) && <CustomAttributesPopup attributes={org.extras} color={customDescriptionColor} />} gridClass="col-xs-12" color={customDescriptionColor} />
              </React.Fragment>
            }
            {
              showSignatures && isExpandedHeader &&
              <div className='col-xs-12 no-side-padding flex-vertical-center' style={{paddingTop: '10px'}}>
                {
                  org.location &&
                  <span style={{marginRight: '10px'}}>
                    <LocationLabel location={org.location} noContainerClass iconSize="medium" containerStyle={customDescriptionColor ? {color: customDescriptionColor} : {}} />
                  </span>
                }
                {
                  org.website &&
                  <span style={{marginRight: '10px'}}>
                    <LinkLabel link={org.website} iconSize='medium' noContainerClass containerStyle={customDescriptionColor ? {color: customDescriptionColor} : {}} />
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
                      containerStyle={customDescriptionColor ? {color: customDescriptionColor} : {}}
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
                      containerStyle={customDescriptionColor ? {color: customDescriptionColor} : {}}
                    />
                  </span>
                }
                {
                  org.external_id &&
                  <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                    <ExternalIdLabel
                      externalId={org.external_id}
                      iconSize='medium'
                      containerStyle={customDescriptionColor ? {color: customDescriptionColor} : {}}
                    />
                  </span>
                }
              </div>
            }
            {extraComponents}
          </div>
          <HomeTabs
            org={org}
            url={url}
            selectedConfig={config}
            tabColor={forgroundTextColor}
            {...rest}
          />
        </div>
        <CommonFormDrawer
          style={{zIndex: 1202}}
          isOpen={orgForm}
          onClose={() => setOrgForm(false)}
          formComponent={
            <OrgForm edit reloadOnSuccess onCancel={() => setOrgForm(false)} org={org} />
          }
        />
      </div>
      {
        canDelete && deleteDialog &&
          <ConceptContainerDelete
            open={deleteDialog}
            resource={org}
            onClose={() => setDeleteDialog(false)}
            onDelete={onDelete}
            associatedResources={['sources', 'collections', 'its content']}
          />
      }

    </header>
  )
}

export default HomeHeader;
