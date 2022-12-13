import React from 'react';
import { Button, Menu, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RestoreFromTrash as RestoreIcon,
  FileCopy as CopyIcon,
  GetApp as DownloadIcon,
  CompareArrows as CompareIcon,
  ArrowDropDown as DownIcon,
  BuildCircle as OperationsIcon,
} from '@mui/icons-material';
import { startCase } from 'lodash';
import { currentUserHasAccess, copyURL, toFullAPIURL, isAdminUser } from '../../common/utils';
import { ACTION_RED } from '../../common/constants';
import DownloadButton from './DownloadButton';
import { OperationsContext } from '../app/LayoutContext';

const ManageSourceChildButton = ({
  instance, currentURL, isVersionedObject, onEditClick, onRetire, onUnretire, mappings, resource, conceptCompareURL
}) => {
  const {openOperations, setOpenOperations} = React.useContext(OperationsContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const toggleMenu = event => setAnchorEl(anchorEl ? null : event.currentTarget)
  const hasAccess = currentUserHasAccess();
  const isAdmin = isAdminUser()
  const onCopyClick = () => copyURL(toFullAPIURL(currentURL.replace('#', '')))
  const onClick = (event, action) => {
    setAnchorEl(null)
    action(event)
  }
  const downloadFileName = isVersionedObject ?
                           `${resource}-${instance.id}` :
                           `${resource}-${instance.id}-version-${instance.version}`;

  const isConcept = resource === 'concept'
  const resourceLabel = startCase(resource)

  const onCompareConceptsClick = event => {
    event.stopPropagation()
    event.preventDefault()

    window.open(conceptCompareURL, '_blank')
  }

  const onOperationsClick = () => {
    setAnchorEl(null)
    setOpenOperations(!openOperations)
  }

  return (
    <React.Fragment>
      <Button variant='text' size='small' onClick={toggleMenu} color='default' style={{textTransform: 'none'}}>
        Actions
        <DownIcon style={{marginLeft: '4px'}} />
      </Button>
      <Menu
        id="versions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={toggleMenu}
      >
        <MenuList dense>
          <MenuItem onClick={event => onClick(event, onCopyClick)}>
            <ListItemIcon style={{minWidth: '28px'}}>
              <CopyIcon fontSize="inherit" />
            </ListItemIcon>
            <ListItemText>
              Copy URL
            </ListItemText>
          </MenuItem>
          {
            hasAccess && isVersionedObject &&
            <MenuItem onClick={event => onClick(event, onEditClick)}>
              <ListItemIcon style={{minWidth: '28px'}}>
                <EditIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                {
                  `Edit ${resourceLabel}`
                }
              </ListItemText>
            </MenuItem>
          }
          {
            conceptCompareURL &&
            <MenuItem onClick={onCompareConceptsClick}>
              <ListItemIcon style={{minWidth: '28px'}}>
                <CompareIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                Compare From/To Concepts
              </ListItemText>
            </MenuItem>
          }
          <DownloadButton
            resource={isConcept ? {...instance, mappings: mappings} : instance}
            filename={downloadFileName}
            queryParams={isConcept ? {includeInverseMappings: true, includeHierarchyPath: true, includeParentConceptURLs: true} : null}
            buttonFunc={params => (
              <MenuItem {...params}>
                <ListItemIcon style={{minWidth: '28px'}}>
                  <DownloadIcon fontSize="inherit" />
                </ListItemIcon>
                <ListItemText>
                  Download
                </ListItemText>
              </MenuItem>
            )}
            tooltipPlacement='right'
          />
          {
            instance.concept_class && isAdmin &&
              <MenuItem onClick={onOperationsClick}>
                <ListItemIcon style={{minWidth: '28px'}}>
                  <OperationsIcon fontSize="inherit" />
                </ListItemIcon>
                <ListItemText>
                  Operations
                </ListItemText>
              </MenuItem>
          }
          {
            hasAccess && isVersionedObject &&
              <MenuItem onClick={event => onClick(event, instance.retired ? onUnretire : onRetire)}>
                <ListItemIcon style={{minWidth: '28px', color: ACTION_RED}}>
                  {
                    instance.retired ?
                      <RestoreIcon fontSize='inherit' /> :
                      <DeleteIcon fontSize='inherit' />
                  }
                </ListItemIcon>
                <ListItemText style={{color: ACTION_RED}}>
                  {
                    instance.retired ?
                      `Un-Retire ${resourceLabel}` :
                      `Retire ${resourceLabel}`
                  }
                </ListItemText>
              </MenuItem>
          }
        </MenuList>
      </Menu>

    </React.Fragment>
  )
}

export default ManageSourceChildButton;
