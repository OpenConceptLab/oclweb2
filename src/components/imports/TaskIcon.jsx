import React from 'react';
import {
  Cancel as FailedIcon,
  CheckCircle as SuccessIcon,
  HourglassFull as PendingIcon,
  Replay as RetryIcon,
  ExpandMore as ExpandIcon,
  PanTool as RevokedIcon,
  Timer as ReceivedIcon,
} from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';
import { ERROR_RED, GREEN, ORANGE, DARKGRAY, WHITE, BLUE } from '../../common/constants';

const getIcon = (status, rest) => {
  if(!status)
    return

  const state = status.toLowerCase()
  if(state === 'failure')
    return <FailedIcon style={{color: ERROR_RED}} {...rest} />;
  if(state === 'success')
    return <SuccessIcon style={{color: GREEN}} {...rest} />;
  if(state === 'pending')
    return <PendingIcon style={{color: ORANGE}} {...rest} />;
  if(state === 'retry')
    return <RetryIcon style={{color: BLUE}} {...rest} />;
  if(state === 'started')
    return <CircularProgress style={{width: '20px', height: '20px'}}  {...rest} />;
  if(state === 'revoked')
    return <RevokedIcon style={{color: DARKGRAY}} {...rest} />;
  if(state === 'received')
    return <RevokedIcon style={{color: BLUE}} {...rest} />;
}

const TaskIcon = ({status, ...rest}) =>  {
  const icon = getIcon(status, rest);
  return (
    <React.Fragment key={status}>
      {icon}
    </React.Fragment>
  )
}


export default TaskIcon
