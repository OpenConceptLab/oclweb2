import React from 'react';
import alertifyjs from 'alertifyjs';
import './Tasks.scss';
import {
  Accordion, AccordionDetails, AccordionSummary, CircularProgress, Tooltip, Divider,
  Button
} from '@material-ui/core';
import {
  Cancel as FailedIcon,
  CheckCircle as SuccessIcon,
  HourglassEmpty as PendingIcon,
  Replay as RetryIcon,
  ExpandMore as ExpandIcon,
  PanTool as RevokedIcon,
} from '@material-ui/icons';
import { get } from 'lodash';
import { formatDateTime, isAdminUser } from '../../common/utils';
import { ERROR_RED, GREEN, ORANGE, DARKGRAY, WHITE, BLUE } from '../../common/constants';

const Task = ({task, open, onOpen, onClose, onRevoke, onDownload}) => {
  const isAdmin = isAdminUser();
  const { details, state, result } = task
  const status = state.toLowerCase()
  const id = task.task
  const onChange = () => open ? onClose() : onOpen(id)
  const getTemplate = (label, value, type) => {
    let formattedValue = value
    if(type === 'timestamp')
      formattedValue = formatDateTime(value*1000)

    return (
      <React.Fragment>
        <div className='col-md-3 no-left-padding' style={{margin: '5px 0'}}>
          {label}:
        </div>
        <div className='col-md-9 no-right-padding' style={{margin: '5px 0', overflow: 'auto'}}>
          {formattedValue || ' - '}
        </div>
        <Divider style={{width: '100%'}}/>
      </React.Fragment>
    )
  }

  const getIcon = () => {
    if(status === 'failure')
      return <FailedIcon style={{color: ERROR_RED}} />;
    if(status === 'success')
      return <SuccessIcon style={{color: GREEN}} />;
    if(status === 'pending')
      return <PendingIcon style={{color: ORANGE}} />;
    if(status === 'pending')
      return <RetryIcon style={{color: BLUE}} />;
    if(status === 'started')
      return <CircularProgress style={{width: '20px', height: '20px'}} />;
    if(status === 'revoked')
      return <RevokedIcon style={{color: DARKGRAY}} />;
  }

  const onCancelTaskClick = event => {
    event.stopPropagation()
    event.preventDefault()

    alertifyjs.confirm(
      `Revoke Task: ${id}`,
      'Stopping a running task may result in a confusing state of content. This action is not reversible. Are you sure you want to cancel this?',
      () => onRevoke(id),
      () => {}
    )

    return false
  }

  const onDownloadTaskClick = event => {
    event.stopPropagation()
    event.preventDefault()
    onDownload(id)
    return false
  }

  return (
    <Accordion expanded={open} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandIcon />} id={id} className={status}>
        <Tooltip title={state}>
          <div className='col-md-12 no-side-padding task-summary flex-vertical-center'>
            <div className='col-md-1 no-left-padding'>
              {getIcon()}
            </div>
            <div className='col-md-11 no-side-padding'>
              <div className='col-md-12 no-side-padding'>{id}</div>
              <div className='col-md-3 no-side-padding sub-text italic'>
                {formatDateTime(details.received * 1000)}
              </div>
              {
                status === 'started' && isAdmin &&
                <Button
                  size='small'
                  variant='contained'
                  onClick={onCancelTaskClick}
                  style={{backgroundColor: ERROR_RED, color: WHITE, padding: '0 5px', fontSize: '0.7125rem', marginLeft: '10px', marginTop: '3px'}}
                  >
                  Cancel
                </Button>
              }
              {
                status === 'success' &&
                <Button
                  size='small'
                  variant='contained'
                  onClick={onDownloadTaskClick}
                  style={{backgroundColor: GREEN, color: WHITE, padding: '0 5px', fontSize: '0.7125rem', marginLeft: '10px', marginTop: '3px'}}
                  >
                  Download
                </Button>
              }
              {
                get(result, 'summary') &&
                <div className='col-md-11 no-side-padding sub-text italic'>
                  { result.summary }
                </div>
              }
            </div>
          </div>
        </Tooltip>
      </AccordionSummary>
      <AccordionDetails>
        <div className='col-md-12 no-side-padding'>
          { getTemplate('Task ID', id) }
          { getTemplate('Name', details.name) }
          { getTemplate('Received', details.received, 'timestamp') }
          { getTemplate('Started', details.received, 'timestamp') }
          { details.runtime && getTemplate('Runtime', `${details.runtime} secs`) }
          { details.failed && getTemplate('Failed', details.failed, 'timestamp') }
          { getTemplate('Retries', details.retries) }
          { details.revoked && getTemplate('Revoked', details.revoked, 'timestamp') }
          { details.exception && getTemplate('Exception', details.exception) }
          { status === 'success' && getTemplate('Result', details.result) }
          { details.args && getTemplate('Args', details.args) }
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default Task;
