import React from 'react';
import { Button, ButtonGroup, Menu, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { merge } from 'lodash';
import {
  Loyalty as LoyaltyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  ArrowDropDown as DownIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { GREEN, WHITE } from '../../common/constants';
import { toParentURI, currentUserHasAccess, copyURL, toFullAPIURL } from '../../common/utils';
import DownloadButton from './DownloadButton';

const CollectionButton = ({label, onClick, href, childURI, onEditClick, onDeleteClick, collection, downloadFileName, style, ...rest}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  let uri = href;
  if(childURI) uri = '#'  + toParentURI(childURI);

  const toggleMenu = event => setAnchorEl(anchorEl ? null : event.currentTarget)
  const hasAccess = currentUserHasAccess();
  const onCopyClick = () => copyURL(toFullAPIURL(encodeURI(uri.replaceAll('#', ''))))
  const onActionClick = (event, action) => {
    setAnchorEl(null)
    action(event)
  }
  const commonButtonStyle = {
    textTransform: 'none',
    minWidth: '30px',
    background: 'inherit',
    color: 'inherit',
  };
  const dropDownButtonStyle = {
    background: 'inherit',
    color: 'inherit',
    padding: '6px 0'
  }
  return (
    <React.Fragment>
      <ButtonGroup variant='contained' style={{background: GREEN, color: WHITE, boxShadow: 'none', textTransform: 'none'}} {...rest}>
        <Button startIcon={<LoyaltyIcon />} onClick={onClick} href={uri} style={merge(commonButtonStyle, style || {})}>
          {label}
        </Button>
        <Button onClick={toggleMenu} style={merge(dropDownButtonStyle, style || {})}>
          <DownIcon />
        </Button>
      </ButtonGroup>
      <Menu
        id="versions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={toggleMenu}
      >
        <MenuList dense>
          <MenuItem onClick={event => onActionClick(event, onCopyClick)}>
            <ListItemIcon style={{minWidth: '28px'}}>
              <CopyIcon fontSize="inherit" />
            </ListItemIcon>
            <ListItemText>
              Copy URL
            </ListItemText>
          </MenuItem>
          {
            hasAccess && onEditClick &&
            <MenuItem onClick={event => onActionClick(event, onEditClick)}>
              <ListItemIcon style={{minWidth: '28px'}}>
                <EditIcon fontSize="inherit" />
              </ListItemIcon>
              <ListItemText>
                Edit Collection
              </ListItemText>
            </MenuItem>
          }
          {
            hasAccess && onDeleteClick &&
            <MenuItem onClick={event => onActionClick(event, onDeleteClick)}>
              <ListItemIcon style={{minWidth: '28px'}}>
                <DeleteIcon fontSize='inherit' />
              </ListItemIcon>
              <ListItemText>
                Delete Collection
              </ListItemText>
            </MenuItem>
          }
          <DownloadButton
            resource={collection}
            filename={downloadFileName}
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
          />

        </MenuList>
      </Menu>
    </React.Fragment>
  )
}

export default CollectionButton;
