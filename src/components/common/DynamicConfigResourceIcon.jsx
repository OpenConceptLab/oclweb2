import React from 'react';
import {
  List as SourceIcon, Loyalty as CollectionIcon, Person as UserIcon,
  Info as InfoIcon, Home as HomeIcon, Link as MappingIcon,
  AccountTreeRounded as VersionIcon, LocalOffer as ConceptIcon
} from '@material-ui/icons';
import { includes } from 'lodash';

const DynamicConfigResourceIcon = ({resource, index, style}) => {
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
