import React from 'react';
import { Icon } from '@material-ui/core';
import {
  List as SourceIcon, Loyalty as CollectionIcon, Person as UserIcon,
  Info as InfoIcon, Home as HomeIcon, Link as MappingIcon,
  AccountTreeRounded as VersionIcon, LocalOffer as ConceptIcon
} from '@material-ui/icons';
import { includes, snakeCase } from 'lodash';

const DynamicConfigResourceIcon = ({resource, index, style, icon}) => {
  if(icon)
    return (<Icon style={{fontSize: '20px'}}>{snakeCase(icon)}</Icon>)
  if(resource === 'sources')
    return (<SourceIcon style={style} />)
  if(resource === 'collections')
    return <CollectionIcon style={style} />
  if(resource === 'users')
    return <UserIcon style={style} />
  if(resource === 'concepts')
    return <ConceptIcon style={style} />
  if(resource === 'mappings')
    return <MappingIcon style={style} />
  if(includes(['versions', 'history'], resource))
    return <VersionIcon style={style} />
  if(index === 0)
    return <HomeIcon style={style} />
  if(includes(['about', 'text'], resource))
    return <InfoIcon style={style} />

  return '';
}

export default DynamicConfigResourceIcon;
