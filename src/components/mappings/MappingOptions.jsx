import React from 'react';
import { Menu, MenuItem, MenuList, IconButton, Divider, ListItemIcon, ListItemText } from '@mui/material';
import {
  MoreVert as MenuIcon,
  Add as AddIcon,
  Delete as RetireIcon,
  CompareArrows as CompareIcon,
  OpenInBrowser as OpenIcon,
} from '@mui/icons-material';
import { map } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';
import { ACTION_RED } from '../../common/constants';

const hasAccess = currentUserHasAccess()

const MappingOptions = ({ mapping, concept, onAddNewClick, onRemove, onReactivate, showNewMappingOption, isIndirect }) => {
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const onMenuToggle = event => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(!open)
    return false;
  }

  const onOptionClick = (event, option) => {
    event.preventDefault()
    event.stopPropagation()
    if(option)
      window.location.hash = option.href

    return false
  }

  const getOptions = () => {
    const options = [{label: 'Open Mapping Details', href: mapping.url, type: 'open'}]
    const currentURL = window.location.hash.split('?')[0].split('#')[1]
    const toConcept = mapping?.from_concept_url ? concept : null
    const fromConcept = mapping?.to_concept_url ? concept : null
    const fromConceptURL = mapping.from_concept_url || fromConcept?.url
    const toConceptURL = mapping?.to_concept_url || toConcept?.url
    const compareConceptHref = `/concepts/compare?lhs=${fromConceptURL}&rhs=${toConceptURL}`
    const addNewMapTypeMappingLabel = (
      <span>
        Add new
        <span style={{margin: '0 5px'}}>
          {mapping?.map_type}
          {isIndirect && <sup>-1</sup>}
        </span>
        mapping
      </span>
    )

    if(fromConceptURL && fromConceptURL !== currentURL)
      options.push({label: 'Open From Concept', href: fromConceptURL, type: 'open'})
    if(toConceptURL && toConceptURL !== currentURL)
      options.push({label: 'Open To Concept', href: toConceptURL, type: 'open'})
    if(fromConceptURL && toConceptURL)
      options.push({label: 'Compare Concepts', href: compareConceptHref, type: 'compare'})
    if(hasAccess && showNewMappingOption)
      options.push({label: addNewMapTypeMappingLabel, onClick: onAddNewMappingClick, type: 'add' })
    if(hasAccess && showNewMappingOption && !mapping.retired)
      options.push({label: `Retire mapping`, onClick: onRemoveMappingClick, type: 'delete' })
    if(hasAccess && showNewMappingOption && mapping.retired)
      options.push({label: `Reactivate mapping`, onClick: onReactivateMappingClick, type: 'delete' })

    return options
  }

  const onAddNewMappingClick = event => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    onAddNewClick(mapping.map_type)
    return false
  }

  const onRemoveMappingClick = event => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    onRemove(mapping)
    return false
  }

  const onReactivateMappingClick = event => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(false)
    onReactivate(mapping)
    return false
  }

  return (
    <React.Fragment>
      <IconButton size='small' color='primary' ref={anchorRef} onClick={onMenuToggle}>
        <MenuIcon fontSize='inherit' />
      </IconButton>
      <Menu open={open} anchorEl={anchorRef.current} onClose={onMenuToggle}>
        <MenuList>
          {
            map(getOptions(), (option, index) => {
              let __props = {}
              if(option.href) {
                __props.href = `/#${option.href}`
                __props.component = 'a'
              }
              if(option.type === 'delete')
                __props['style'] = {color: ACTION_RED}
              return (
                <React.Fragment key={index}>
                  {
                    ['add', 'delete', 'compare'].includes(option.type) && <Divider />
                  }
                  <MenuItem onClick={event => option.onClick ? option.onClick(event, option, mapping) : onOptionClick(event, option)} {...__props}>
                    <ListItemIcon>
                      {
                        option.type === 'add' && <AddIcon fontSize='small'/>
                      }
                      {
                        option.type === 'delete' && <RetireIcon fontSize='small' style={{color: ACTION_RED}}/>
                      }
                      {
                        option.type === 'compare' && <CompareIcon fontSize='small'/>
                      }
                      {
                        option.type === 'open' && <OpenIcon fontSize='small'/>
                      }
                    </ListItemIcon>
                    <ListItemText>{option.label}</ListItemText>
                  </MenuItem>
                </React.Fragment>
              )
            })
          }
        </MenuList>
      </Menu>
    </React.Fragment>
  )
}

export default MappingOptions;
