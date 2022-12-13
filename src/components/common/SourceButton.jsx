import React from 'react';
import { Button, ButtonGroup, Menu, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { merge } from 'lodash';
import {
  List as ListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  ArrowDropDown as DownIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { GREEN, WHITE, ACTION_RED } from '../../common/constants';
import { toParentURI, currentUserHasAccess, copyURL, toFullAPIURL } from '../../common/utils';
import DownloadButton from './DownloadButton';

const SourceButton = ({label, onClick, href, childURI, onEditClick, onDeleteClick, source, downloadFileName, style, noActions, ...rest}) => {
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
      <Tooltip title={label || ''} arrow>
        <ButtonGroup variant='contained' style={{background: GREEN, color: WHITE, boxShadow: 'none', textTransform: 'none'}} {...rest}>
          <Button className='button-controlled' startIcon={<ListIcon />} onClick={onClick} href={uri} style={merge(commonButtonStyle, style || {})}>
            {label}
          </Button>
          {
            !noActions &&
            <Button onClick={toggleMenu} style={merge(dropDownButtonStyle, style || {})}>
              <DownIcon />
            </Button>
          }
        </ButtonGroup>
      </Tooltip>
      {
        Boolean(anchorEl) &&
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
                  Edit Source
                </ListItemText>
              </MenuItem>
            }
            <DownloadButton
              resource={source}
              filename={downloadFileName}
              tooltipPlacement="right"
              buttonFunc={params => (
                <MenuItem {...params}>
                  <ListItemIcon style={{minWidth: '28px'}}>
                    <DownloadIcon fontSize="inherit" />
                  </ListItemIcon>
                  <ListItemText>
                    Download Metadata
                  </ListItemText>
                </MenuItem>
              )}
            />
            {
              hasAccess && onDeleteClick &&
                <MenuItem onClick={event => onActionClick(event, onDeleteClick)}>
                  <ListItemIcon style={{minWidth: '28px', color: ACTION_RED}}>
                    <DeleteIcon fontSize='inherit' />
                  </ListItemIcon>
                  <ListItemText style={{color: ACTION_RED}}>
                    Delete Source
                  </ListItemText>
                </MenuItem>
            }
          </MenuList>
        </Menu>
      }
    </React.Fragment>
  )
}

export default SourceButton;
