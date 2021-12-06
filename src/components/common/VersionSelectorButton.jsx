import React from 'react';
import { Button, ButtonGroup, MenuList, MenuItem, Tooltip } from '@mui/material';
import {
  AccountTreeRounded as VersionIcon,
  ArrowDropDown as DownIcon,
  NewReleases as ReleaseIcon,
  BrightnessAuto as AutoIcon
} from '@mui/icons-material';
import { WHITE, RED, BLACK, GREEN } from '../../common/constants';
import PopperGrow from './PopperGrow';

const HEAD = 'HEAD';

const VersionSelectorButton = ({selected, versions}) => {
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
    setSelectedVersion(version)
    setOpen(false);
    window.location.hash = version.version_url
  }

  React.useEffect(() => setSelectedVersion(selected), [selected])

  const getButtonGroupProps = () => {
    if(selectedVersion.version === HEAD) {
      return {variant: 'outlined', className: 'btn-group-concept-container-hover-appear'}
    }
    return {variant: 'contained', className: 'btn-group-concept-container'}
  }

  return (
    <React.Fragment>
      <ButtonGroup ref={anchorRef} {...getButtonGroupProps()}>
        <Button
          style={versionButtonStyle}
          startIcon={<VersionIcon fontSize='inherit' />}
        >
          {selectedVersion.version}
        </Button>
        <Button
          style={{...commonButtonStyle, padding: 0}}
          onClick={handleToggle}
        >
          <DownIcon fontSize='inherit' />
        </Button>
      </ButtonGroup>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose} minWidth="150px">
        <MenuList id="split-button-menu">
          {
            versions.map(version => (
              <MenuItem
                key={version.version}
                selected={version.version === selectedVersion.version}
                onClick={() => handleMenuItemClick(version)}
                >
                <span className='flex-vertical-center'>
                  <span>
                    {version.version}
                  </span>
                  {
                    version.released &&
                    <Tooltip title='Released'>
                      <span className='flex-vertical-center' style={{marginLeft: '5px'}}>
                        <ReleaseIcon fontSize='inherit' color='primary' />
                      </span>
                    </Tooltip>
                  }
                  {
                    (version.autoexpand || version.autoexpand_head) &&
                    <Tooltip title='Auto Expanded'>
                      <span className='flex-vertical-center' style={{marginLeft: '5px'}}>
                        <AutoIcon fontSize='inherit' style={{color: GREEN}} />
                      </span>
                    </Tooltip>
                  }
                </span>
              </MenuItem>
            ))
          }
        </MenuList>
      </PopperGrow>
    </React.Fragment>
  )
}

export default VersionSelectorButton;
