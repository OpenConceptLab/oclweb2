import React from 'react';
import {
  Cancel as FailedIcon,
  CheckCircle as SuccessIcon,
  HourglassFull as PendingIcon,
  Replay as RetryIcon,
  PanTool as RevokedIcon,
  Timer as ReceivedIcon,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { get } from 'lodash';
import { ERROR_RED, GREEN, ORANGE, DARKGRAY, BLUE } from '../../common/constants';

const COLORS = {
  failure: ERROR_RED, success: GREEN, pending: ORANGE, retry: BLUE, started: BLUE,
  revoked: DARKGRAY, received: BLUE
};

const getIcon = (status, rest) => {
  if(!status)
    return;

  const state = status.toLowerCase();
  const color = COLORS[state];
  const width = get(rest, 'width', '20px');
  const height = get(rest, 'height', '20px');

  if(state === 'failure')
    return <FailedIcon style={{color: color}} {...rest} />;
  if(state === 'success')
    return <SuccessIcon style={{color: color}} {...rest} />;
  if(state === 'pending')
    return <PendingIcon style={{color: color}} {...rest} />;
  if(state === 'retry')
    return <RetryIcon style={{color: color}} {...rest} />;
  if(state === 'started')
    return <CircularProgress style={{color: BLUE, width: width, height: height}}  {...rest} />;
  if(state === 'revoked')
    return <RevokedIcon style={{color: color}} {...rest} />;
  if(state === 'received')
    return <ReceivedIcon style={{color: color}} {...rest} />;
}


export const getTaskIconDetails = (status, rest) => {
  const icon = getIcon(status, rest);
  return {
    icon: icon,
    status: status,
    color: COLORS[status.toLowerCase()]
  }
}
