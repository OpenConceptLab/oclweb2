import React from 'react';
import moment from 'moment';
import {
  Collapse, IconButton, Tooltip, Chip
} from '@material-ui/core';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon
} from '@material-ui/icons';
import { filter, map, startCase, includes, without, uniq, isEmpty } from 'lodash';
import { BLACK } from '../../common/constants';
import { formatDate } from '../../common/utils';
import ChipDatePicker from '../common/ChipDatePicker';
import SearchInput from '../search/SearchInput';
import Tasks from './Tasks';
import { getTaskIconDetails } from './utils';

const STATUSES = ['pending', 'received', 'started', 'revoked', 'retry', 'failure', 'success']

const ExistingImports = ({isLoading, onRefresh, onRevoke, onDownload, tasks, error }) => {
  const [queues, setQueueFilter] = React.useState([])
  const [statuses, setStatusFilter] = React.useState([])
  const [searchText, setSearchText] = React.useState('');
  const [openFilters, setOpenFilters] = React.useState(false);
  const [date, setDate] = React.useState('');
  const toggleFilters = () => setOpenFilters(!openFilters);
  const onSearch = input => setSearchText(input);
  const anyFilterApplied = Boolean(searchText || date || !isEmpty(queues) || !isEmpty(statuses))
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
    if(date)
      tasks = filter(tasks, task => moment((task.details.started || task.details.received) * 1000).isSame(date, 'day'))
    if(!isEmpty(statuses))
      tasks = filter(tasks, task => includes(statuses, task.state.toLowerCase()))
    if(!isEmpty(queues))
      tasks = filter(tasks, task => includes(queues, task.task.split('~')[1]))

    return tasks
  }
  const getTitle = () => {
    const prefix = 'Existing Imports'

    if(isLoading || error)
      return prefix

    if(anyFilterApplied)
      return `${prefix} (${getTasks().length}/${tasks.length})`

    return `${prefix} (${tasks.length})`
  }

  const onDateChange = date => setDate(date || '');
  const getDateText = () => date ? formatDate(date) : 'All Time';

  const toggleStatusFilter = status => setStatusFilter(
    includes(statuses, status) ? without(statuses, status) : [...statuses, status]
  )
  const toggleQueueFilter = queue => setQueueFilter(
    includes(queues, queue) ? without(queues, queue) : [...queues, queue]
  )

  const getQueues = () => uniq(map(tasks, task => task.task.split('~')[1]))

  return (
    <React.Fragment>
      <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>
          {getTitle()}
        </span>
        <span>
          <Tooltip title='Filter by queue or status'>
            <IconButton style={{marginRight: '5px'}} variant='outlined' color='secondary' disabled={isLoading} onClick={toggleFilters}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Refresh List'>
            <IconButton variant='outlined' color='secondary' disabled={isLoading} onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </span>
      </h3>
      <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginBottom: '10px', marginTop: '-5px'}}>
        <div className='col-md-9 no-left-padding'>
          <SearchInput
            onChange={onSearch}
            onSearch={onSearch}
            searchInputPlaceholder='Search by id, status or queue name...'
            noExactMatch
          />
        </div>
        <div className='col-md-3 no-side-padding' style={{textAlign: 'left'}}>
          <ChipDatePicker onChange={onDateChange} label={getDateText()} date={date} size='medium' />
        </div>
      </div>
      <Collapse in={openFilters} className='col-md-12' style={{padding: '0px', display: openFilters ? 'block' : 'none', marginBottom: openFilters ? '10px' : '0px'}}>
        <div className='col-md-12 no-side-padding flex-vertical-center'>
          <div className='col-md-1 no-left-padding sub-text italic' style={{fontSize: '12px', color: 'gray'}}>
            Statuses:
          </div>
          <div className='col-md-11 no-right-padding' style={{paddingLeft: '2px'}}>
            {
              map(STATUSES, status => {
                const { icon, color } = getTaskIconDetails(status, {height: '14px', width: '14px'})
                const isApplied = includes(statuses, status)
                return (
                  <Chip
                    size='small'
                    key={status}
                    icon={icon}
                    label={startCase(status)}
                    variant='outlined'
                    style={{
                      color: color, border: `1px solid ${color}`,
                      marginRight: '2px'
                    }}
                    onClick={() => toggleStatusFilter(status)}
                    onDelete={() => toggleStatusFilter(status)}
                    deleteIcon={
                      isApplied ?
                                <CheckIcon style={{color: color}} /> :
                                <span style={{width: '0px', height: '0px'}} />
                    }
                  />
                )
              })
            }
          </div>
        </div>
        <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '10px'}}>
          <div className='col-md-1 no-left-padding sub-text italic' style={{fontSize: '12px', color: 'gray'}}>
            Queues:
          </div>
          <div className='col-md-11 no-right-padding' style={{paddingLeft: '2px'}}>
            {
              map(getQueues(), queue => {
                const isApplied = includes(queues, queue)
                return (
                  <Chip
                    key={queue}
                    size='small'
                    label={queue}
                    variant='outlined'
                    style={{
                      marginRight: '2px', border: `1px solid ${BLACK}`
                    }}
                    onClick={() => toggleQueueFilter(queue)}
                    onDelete={() => toggleQueueFilter(queue)}
                    deleteIcon={
                      isApplied ?
                                <CheckIcon /> :
                                <span style={{width: '0px', height: '0px'}} />
                    }
                  />
                )
              })
            }
          </div>
        </div>
      </Collapse>
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
