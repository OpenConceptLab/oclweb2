import React from 'react';
import {
  AspectRatio as ExpansionIcon,
} from '@material-ui/icons';
import ReleasedChip from './ReleasedChip';
import RetiredChip from './RetiredChip';
import ProcessingChip from './ProcessingChip';

const SEPARATOR = '/'
const ExpansionLabel = props => {
  return (
    <div className='col-sm-12 no-side-padding'>
      <span className='resource-label'>
        <span style={{paddingTop: '5px'}}>
          <ExpansionIcon fontSize='small' style={{width: '14px'}} />
        </span>
        {
          props.owner &&
          <React.Fragment>
            <span>{props.owner}</span>
            <span>{SEPARATOR}</span>
          </React.Fragment>
        }
        {
          props.short_code &&
          <React.Fragment>
            <span>{props.short_code}</span>
            <span>{SEPARATOR}</span>
          </React.Fragment>
        }
        {
          props.version &&
          <React.Fragment>
            <span>{props.version}</span>
            <span>{SEPARATOR}</span>
          </React.Fragment>
        }
        <span className='resource-name' style={{marginTop: '-2px'}}>[{props.mnemonic}]</span>
      </span>
      {
        props.released &&
        <span style={{marginLeft: '10px'}}>
          <ReleasedChip size='small' />
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
    </div>
  )
}

export default ExpansionLabel;
