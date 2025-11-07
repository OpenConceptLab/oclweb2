import React from 'react';
import {
  AccountTreeRounded as TreeIcon,
  AspectRatio as ExpansionIcon,
  ChevronRight as SeparatorIcon,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import ReleasedChip from './ReleasedChip';
import RetiredChip from './RetiredChip';
import ProcessingChip from './ProcessingChip';
import ExpansionChip from './ExpansionChip';
import VersionVectorizedChip from './VersionVectorizedChip'
import AccessChip from './AccessChip';
import { GREEN } from '../../common/constants';

const SEPARATOR = (<SeparatorIcon />)
const ResourceVersionLabel = props => {
  const gridClass = props.gridClass || 'col-sm-12'
  return (
    <div className={`${gridClass} no-side-padding`}>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>
          <TreeIcon fontSize='small' style={{width: '14px'}} />
        </span>
        <span>{props.owner}</span>
        <span className='separator-small'>{SEPARATOR}</span>
        <span>{props.short_code}</span>
        <span className='separator-small'>{SEPARATOR}</span>
        <span className='resource-name'>[{props.version}]</span>
      </span>
      {
        props.showAccess && props.public_access &&
          <span style={{marginLeft: '10px'}}>
            <AccessChip size='small' publicAccess={props.public_access} />
          </span>
      }
      {
        props.released &&
        <span style={{marginLeft: '10px'}}>
          <ReleasedChip size='small' />
        </span>
      }
      {
        props.match_algorithms?.includes('llm') &&
          <span style={{marginLeft: '10px'}}>
            <VersionVectorizedChip size='small' />
          </span>
      }
      {
        props.retired &&
        <span style={{marginLeft: '10px'}}>
          <RetiredChip size='small' />
        </span>
      }
      {
        props.is_processing &&
        <span style={{marginLeft: '10px'}}>
          <ProcessingChip size='small' />
        </span>
      }
      {
        props.includeExpanded && props.autoexpand &&
        <span style={{marginLeft: '10px'}}>
          <ExpansionChip size='small' expanded />
        </span>
      }
      {
        props.includeExpansionIcon && props.autoexpand &&
        <span style={{marginLeft: '10px', display: 'inline-flex', verticalAlign: 'middle'}}>
          <Tooltip arrow title='Auto-Expand' placement='right'>
            <ExpansionIcon style={{color: GREEN}}/>
          </Tooltip>
        </span>
      }
    </div>
  )
}

export default ResourceVersionLabel;
