import React from 'react';

const Task = props => {
  return (
    <div>
    {
      JSON.stringify(props, undefined, 2)
    }
  </div>
  )
}

export default Task;

