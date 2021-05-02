import React from 'react';
import moment from 'moment';
import { Button } from '@material-ui/core';
import { filter } from 'lodash';
import { formatDate } from '../../common/utils';
import ChipDatePicker from '../common/ChipDatePicker';
import SearchInput from '../search/SearchInput';
import Tasks from './Tasks';

const ExistingImports = ({isLoading, onRefresh, onRevoke, onDownload, tasks, error }) => {
  const [searchText, setSearchText] = React.useState('');
  const [date, setDate] = React.useState('');
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
  const getTasks = () => {
    let tasks = searchedTasks()
    if(date) {
      tasks = filter(
        tasks,
        task => moment((task.details.started || task.details.received) * 1000).isSame(date, 'day')
      )
    }
    return tasks
  }
  const getTitle = () => {
    const prefix = 'Existing Imports'

    if(isLoading || error)
      return prefix

    if(searchText || date)
      return `${prefix} (${getTasks().length}/${tasks.length})`

    return `${prefix} (${tasks.length})`
  }

  const onDateChange = date => setDate(date || '');
  const getDateText = () => date ? formatDate(date) : 'All Time';

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
      <div className='col-md-12 no-side-padding flex-vertical-center'>
        <div className='col-md-8 no-left-padding'>
        <SearchInput
          onChange={onSearch}
          onSearch={onSearch}
          searchInputPlaceholder='Search by id, status or queue name...'
          noExactMatch
        />
        </div>
        <div className='col-md-4 no-side-padding'>
          <ChipDatePicker onChange={onDateChange} label={getDateText()} date={date} size='medium' />
        </div>
      </div>
      <div>
        <Tasks
          tasks={getTasks()}
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
