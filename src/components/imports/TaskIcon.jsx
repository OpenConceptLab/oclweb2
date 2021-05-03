import React from 'react';
import { getTaskIconDetails } from './utils';

const TaskIcon = ({status, ...rest}) => (
  <React.Fragment key={status}>
    {getTaskIconDetails(status, rest).icon}
  </React.Fragment>
)

export default TaskIcon
