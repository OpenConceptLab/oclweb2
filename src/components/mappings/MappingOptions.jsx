import React from 'react';
import { Menu, MenuItem, MenuList, IconButton } from '@mui/material';
import { MoreVert as MenuIcon } from '@mui/icons-material';
import { map } from 'lodash';

const MappingOptions = ({ mapping, concept }) => {
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

    return options
  }

  return (
    <React.Fragment>
      <IconButton size='small' color='primary' ref={anchorRef} onClick={onMenuToggle}>
        <MenuIcon fontSize='inherit' />
      </IconButton>
      <Menu open={open} anchorEl={anchorRef.current} onClose={onMenuToggle}>
        <MenuList>
          {
            map(getOptions(), (option, index) => (
              <MenuItem key={index} component='a' href={`/#${option.href}`} onClick={event => onOptionClick(event, option)}>
                {option.label}
              </MenuItem>
            ))
          }
        </MenuList>
      </Menu>
    </React.Fragment>
  )
}

export default MappingOptions;
