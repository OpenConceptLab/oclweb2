import React from 'react';
import { Button, ButtonGroup, MenuList, MenuItem } from '@mui/material';
import {
  ArrowDropDown as DownIcon,
  AspectRatio as ExpansionIcon
} from '@mui/icons-material';
import { get, isEmpty, find } from 'lodash';
import { WHITE, RED, BLACK, DARKGRAY } from '../../common/constants';
import PopperGrow from './PopperGrow';

const ExpansionSelectorButton = ({version, selected, expansions}) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const getDefaultSelectedExpansion = () => {
    if(isEmpty(selected) && !isEmpty(expansions) && get(version, 'expansion_url'))
      return find(expansions, {url: version.expansion_url}) || {}
    return selected || {}
  }
  const [selectedExpansion, setSelectedExpansion] = React.useState(getDefaultSelectedExpansion)

  const isDefaultExpansion = version.expansion_url && version.expansion_url === get(selectedExpansion, 'url');
  const commonButtonStyle = {
    textTransform: 'none',
    minWidth: '30px',
  };
  const expansionButtonStyle = selectedExpansion && selectedExpansion.retired ?
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

  const handleMenuItemClick = expansion => {
    setSelectedExpansion(expansion)
    setOpen(false);
    window.location.hash = expansion.url
  }

  React.useEffect(() => {
    setSelectedExpansion(getDefaultSelectedExpansion())
  }, [selected, expansions])

  const getButtonGroupProps = () => {
    if(isEmpty(selected) || isDefaultExpansion) {
      return {variant: 'outlined', className: 'btn-group-concept-container-hover-appear'}
    }
    return {variant: 'contained', className: 'btn-group-concept-container'}
  }

  return (
    <React.Fragment>
      <ButtonGroup ref={anchorRef} {...getButtonGroupProps()}>
        <Button
          style={expansionButtonStyle}
          startIcon={<ExpansionIcon fontSize='inherit' />}
        >
          {selectedExpansion.mnemonic}
        </Button>
        <Button
          style={{...commonButtonStyle, padding: 0}}
          onClick={handleToggle}
        >
          <DownIcon fontSize='inherit' />
        </Button>
      </ButtonGroup>
      <PopperGrow open={open} anchorRef={anchorRef} handleClose={handleClose} minWidth="150px">
        <MenuList id="split-button-menu" style={{paddingTop: '0px'}}>
          <p style={{margin: 0, padding: '5px 10px', borderBottom: `1px solid ${DARKGRAY}`}}>
            <b>Expansions</b>
          </p>
          {
            expansions.map(expansion => {
              let label = expansion.mnemonic
              label += expansion.url === version.expansion_url ? ' (default)' : ''
              return (
              <MenuItem
                key={expansion.id}
                selected={expansion.id === selectedExpansion.id}
                onClick={() => handleMenuItemClick(expansion)}
                >
                {label}
              </MenuItem>
            )})
          }
        </MenuList>
      </PopperGrow>
    </React.Fragment>
  )
}

export default ExpansionSelectorButton;
