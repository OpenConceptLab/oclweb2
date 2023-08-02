import React from 'react';
import { Divider, Collapse, Chip } from '@mui/material'
import {ArrowRight as RightIcon, ArrowDropDown as DownIcon} from '@mui/icons-material'
import { get, isObject } from 'lodash';
import { ERROR_RED } from '../../common/constants';

const ErrorUI = ({header, message, error, errorInfo}) => {
  const [open, setOpen] = React.useState(false)
  const icon = open ?
               <DownIcon style={{color: ERROR_RED}} /> :
               <RightIcon style={{color: ERROR_RED}} />;
  const errorDetails = get(errorInfo, 'componentStack') ? errorInfo.componentStack : JSON.stringify(errorInfo, undefined, 2);
  const errorMsg = isObject(error) ? error.toString() : error;
  return (
    <React.Fragment>
      <div className='not-found'>
        <div className='flex-vertical-center'>
        <h1>{header}</h1>
        <Divider orientation="vertical" />
        <div className='not-found-text'>
          <h2 dangerouslySetInnerHTML={{__html: message}} />
        </div>
          </div>
      {
        errorMsg &&
          <div style={{color: ERROR_RED, display: 'inline-block', textAlign: 'center', marginTop: '15px'}}>
          <Chip
            className='error-chip no-border'
            variant='outlined'
            icon={icon}
            label='Error Details'
            onClick={() => setOpen(!open)}
          />
            <Collapse className='collapsed-error-details' in={open} timeout='auto' style={{background: 'rgba(244,67,54, 0.1)', padding: '10px', textAlign: 'left'}}>
            <h4 style={{marginBottom: '-15px', marginTop: '0px'}}>{errorMsg}</h4>
            <pre style={{whiteSpace: 'pre-wrap', marginTop: '2px'}}>
              {errorDetails}
            </pre>
          </Collapse>
        </div>
      }
      </div>
    </React.Fragment>
  )
}

export default ErrorUI;
