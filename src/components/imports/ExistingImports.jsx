import React from 'react';
import { Button } from '@material-ui/core';
import { filter } from 'lodash';
import SearchInput from '../search/SearchInput';
import Tasks from './Tasks';

const ExistingImports = ({isLoading, onRefresh, onRevoke, onDownload, tasks, error }) => {
  const [searchText, setSearchText] = React.useState('');
  const onSearch = input => setSearchText(input);
  const searchedTasks = () => {
    if(!searchText)
      return tasks

    const input = searchText.toLowerCase();

    return filter(
      tasks,
      task => task.task.toLowerCase().match(input) || task.state.toLowerCase().match(input)
    )
  }
  const getTitle = () => {
    const prefix = 'Existing Imports'
    if(isLoading || error)
      return prefix

    if(searchText)
      return `${prefix} (${searchedTasks().length}/${tasks.length})`

    return `${prefix} (${tasks.length})`
  }
  return (
    <React.Fragment>
      <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>
          {getTitle()}
        </span>
        <span>
          <Button variant='outlined' size='small' color='secondary' disabled={isLoading} onClick={onRefresh}>
            Refresh
          </Button>
        </span>
      </h3>
      <div>
        <SearchInput
          onChange={onSearch}
          onSearch={onSearch}
          searchInputPlaceholder='Search by id, status or queue name...'
          noExactMatch
        />
      </div>
      <div>
        <Tasks
          tasks={searchedTasks()}
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
