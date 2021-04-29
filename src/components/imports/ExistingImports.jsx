import React from 'react';
import { Button } from '@material-ui/core';
import Tasks from './Tasks';

const ExistingImports = ({isLoading, onRefresh, onRevoke, onDownload, tasks, error }) => {
  const title = (isLoading || error) ? 'Existing Imports' : `Existing Imports (${tasks.length})`

  return (
    <React.Fragment>
      <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>
          {title}
        </span>
        <span>
          <Button variant='outlined' size='small' color='secondary' disabled={isLoading} onClick={onRefresh}>
            Refresh
          </Button>
        </span>
      </h3>
      <div>
        <Tasks
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onRevoke={onRevoke}
          onDownload={onDownload}
        />
      </div>
    </React.Fragment>
  )
}

export default ExistingImports;
