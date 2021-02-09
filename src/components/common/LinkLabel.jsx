import React from 'react';
import { Link as LinkIcon } from '@material-ui/icons';
import { formatWebsiteLink } from '../../common/utils';

const STYLES = {
  medium: {
    icon: {width: '9.5pt', marginTop: '-3px', marginRight: '4px'},
    fontSize: '9.5pt',
  },
  small: {
    icon: {width: '8pt', marginTop: '-4px', marginRight: '4px'},
    fontSize: '8pt',
  }
}

const LinkLabel = props => {
  const containerClass = props.noContainerClass ? '' : 'col-sm-12 no-side-padding';
  const styles = STYLES[props.iconSize || 'small']
  return (
    <div className={`${containerClass} resource-metadata`} style={{fontSize: styles.fontSize}}>
      <span>
        <LinkIcon style={styles.icon} />
      </span>
      <span className='ellipsis-text' style={{maxWidth: '300px'}}>
        {formatWebsiteLink(props.link, {color: 'inherit'})}
      </span>
    </div>
  )
}

export default LinkLabel;
