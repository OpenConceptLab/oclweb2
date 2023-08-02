import React from 'react';
import { useLocation } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import { Button, ButtonGroup, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import {
  AccountTreeRounded as VersionIcon,
  ArrowDropDown as DownIcon,
  NewReleases as ReleaseIcon,
  BrightnessAuto as AutoIcon
} from '@mui/icons-material';
import { merge } from 'lodash';
import { headFirst } from '../../common/utils';
import { WHITE, RED, BLACK, GREEN } from '../../common/constants';
import PopperGrow from './PopperGrow';

const HEAD = 'HEAD';

const VersionSelectorButton = ({selected, versions, style, ...rest}) => {
  const location = useLocation()
  const [open, setOpen] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState(selected)
  const anchorRef = React.useRef(null);
  const commonButtonStyle = {
    textTransform: 'none',
    minWidth: '30px',
  };
  const versionButtonStyle = selectedVersion.retired ?
        {
          ...commonButtonStyle,
          borderRight: WHITE,
          background: 'lightgray',
          color: RED,
          textDecoration: 'line-through',
          textDecorationColor: BLACK,
          textTransform: 'none'
        } :
        {
          ...commonButtonStyle,
        };
  const handleToggle = () => setOpen(prevOpen => !prevOpen)
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleMenuItemClick = version => {
    let prevVersion = selectedVersion
    setSelectedVersion(version)
    setOpen(false);
    let pathname = location.pathname.replace(prevVersion.version_url || prevVersion.url, '')
    if(!pathname || pathname.length == 1)
      pathname = ''
    window.location.hash = version.version_url + (pathname || '')
  }

  React.useEffect(() => setSelectedVersion(selected), [selected])

  const getButtonGroupProps = () => {
    if((selectedVersion.version || selectedVersion.id) === HEAD)
      return {variant: 'outlined', className: 'btn-group-concept-container-hover-appear'}

    return {variant: 'contained', className: 'btn-group-concept-container'}
  }

  const orderedVersions = headFirst(versions)

  return (
    <React.Fragment>
      <ButtonGroup ref={anchorRef} {...getButtonGroupProps()} {...rest}>
        <Button
          style={merge(versionButtonStyle, style || {})}
          startIcon={<VersionIcon fontSize='inherit' />}
          onClick={handleToggle}
        >
          {selectedVersion.version || selectedVersion.id}
          <DownIcon style={{marginLeft: '2px'}} />
        </Button>
      </ButtonGroup>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose} minWidth="150px">
        <FixedSizeList
          height={300}
          itemSize={46}
          itemCount={versions.length}
          overscanCount={5}
        >
          {
            ({ index, style }) => {
              const version = orderedVersions[index]
              const versionId = version.version || version.id
              return (
                <ListItem
                  style={style}
                  key={index}
                  selected={versionId === (selectedVersion.version || selectedVersion.id)}
                  disablePadding
                  component="div"
                >
                  <ListItemButton onClick={() => handleMenuItemClick(version)}>
                    <ListItemIcon style={{}}>
                    {
                      version.released &&
                        <ReleaseIcon fontSize='inherit' color='primary' style={{margin: '0 2px'}} />
                    }
                    {
                      (version.autoexpand || version.autoexpand_head) &&
                        <AutoIcon fontSize='inherit' style={{color: GREEN, margin: '0 2px'}} />
                    }
                  </ListItemIcon>
                    <ListItemText primary={versionId} />
                    </ListItemButton>
                </ListItem>
              )
            }
          }
        </FixedSizeList>
      </PopperGrow>
    </React.Fragment>
  )
}

export default VersionSelectorButton;
