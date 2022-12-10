import React from 'react';
import { Menu, MenuItem, MenuList, IconButton } from '@mui/material';
import { MoreVert as MenuIcon } from '@mui/icons-material';
import { map } from 'lodash';
import { currentUserHasAccess } from '../../common/utils';

const hasAccess = currentUserHasAccess()

const MappingOptions = ({ mapping, concept, onAddNewClick, onRemove, showNewMappingOption }) => {
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
    const options = [{label: 'Open Mapping Details', href: mapping.url},]
    const currentURL = window.location.hash.split('?')[0].split('#')[1]
    const toConcept = mapping?.from_concept_url ? concept : null
    const fromConcept = mapping?.to_concept_url ? concept : null
    const fromConceptURL = mapping.from_concept_url || fromConcept?.url
    const toConceptURL = mapping?.to_concept_url || toConcept?.url
    const compareConceptHref = `/concepts/compare?lhs=${fromConceptURL}&rhs=${toConceptURL}`

    if(fromConceptURL && fromConceptURL !== currentURL)
      options.push({label: 'Open From Concept', href: fromConceptURL})
    if(toConceptURL && toConceptURL !== currentURL)
      options.push({label: 'Open To Concept', href: toConceptURL})
    if(fromConceptURL && toConceptURL)
      options.push({label: 'Compare Concepts', href: compareConceptHref})
    if(hasAccess && showNewMappingOption)
      options.push({label: `Add new ${mapping.map_type} mapping`, onClick: onAddNewMappingClick })
    if(hasAccess && showNewMappingOption && !mapping.retired)
      options.push({label: `Retire mapping`, onClick: onRemoveMappingClick, type: 'delete' })

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
                __props['style'] = {color: '#d32f2f'}
              return (
                <MenuItem key={index} onClick={event => option.onClick ? option.onClick(event, option, mapping) : onOptionClick(event, option)} {...__props}>
                  {option.label}
                </MenuItem>
              )
            })
          }
        </MenuList>
      </Menu>
    </React.Fragment>
  )
}

export default MappingOptions;
