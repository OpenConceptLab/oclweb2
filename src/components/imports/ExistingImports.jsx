import React from 'react';
import moment from 'moment';
import {
  Collapse, IconButton, Tooltip, Chip, Badge
} from '@mui/material';
import { Alert } from '@mui/material';
import {
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { filter, map, startCase, includes, without, uniqBy, isEmpty, orderBy, forEach } from 'lodash';
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
  const filteredTasks = getTasks()
  const getTasksCountByDate = () => {
    const results = {}
    forEach(tasks, task => {
      const date = task.details.started || task.details.received
      const fDate = moment(date * 1000).format('DD-MM-YYYY')
      if(!results[fDate])
        results[fDate] = 0
      results[fDate] += 1;
    })
    return results
  }
  const tasksCountByDate = getTasksCountByDate()
  const getTitle = () => {
    const prefix = 'Existing Imports'

    if(isLoading || error)
      return prefix

    if(anyFilterApplied)
      return `${prefix} (${filteredTasks.length}/${tasks.length})`

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
  const getQueueName = task => task.task.split('~')[1]
  const getStatusCount = status => filter(tasks, {state: status.toUpperCase()}).length
  const getQueueCount = queue => filter(tasks, task => getQueueName(task) === queue).length
  const appliedStatusQueueFilterCount = statuses.length + queues.length;
  const getAllStatuses = () => orderBy(map(STATUSES, status => {
    const count = getStatusCount(status)
    return {
      id: status, label: `${startCase(status)} (${count})`, count: count,
      isApplied: includes(statuses, status),
      ...getTaskIconDetails(status, {fontSize: 'inherit', height: '14px', width: '14px'}),
    }
  }), 'count', 'desc');

  const getAllQueues = () => orderBy(uniqBy(map(tasks, task => {
    const name = getQueueName(task)
    const count = getQueueCount(name)
    return {
      id: name, count: count, isApplied: includes(queues, name), label: `${name} (${count})`
    }
  }), 'id'), 'count', 'desc')

  return (
    <React.Fragment>
      <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
        <Alert className='flex-vertical-center' severity="warning" style={{padding: '5px 10px', width: '100%'}} icon={<InfoIcon fontSize='small' />}>
          <span style={{marginLeft: '-3px'}}>
            Results will expire after <strong>72 hours</strong> from the task&apos;s start time
          </span>
        </Alert>
      </div>
      <div className='col-md-12 no-side-padding'>
        <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0px', marginBottom: '5px'}}>
          <span>
            {getTitle()}
          </span>
          <span>
            <Tooltip arrow title='Filter by queue or status'>
              <span>
                <IconButton
                  style={{marginRight: '5px'}}
                  variant='outlined'
                  color={appliedStatusQueueFilterCount || openFilters ? 'primary' : 'secondary'}
                  disabled={isLoading}
                  onClick={toggleFilters}
                  size="large">
                  <Badge badgeContent={appliedStatusQueueFilterCount} color='primary'>
                    <FilterIcon />
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip arrow title='Refresh List'>
              <span>
                <IconButton
                  variant='outlined'
                  color='secondary'
                  disabled={isLoading}
                  onClick={onRefresh}
                  size="large">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </span>
        </h3>
      </div>
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
          <ChipDatePicker
            tooltip="Filter by date"
            onChange={onDateChange}
            label={getDateText()}
            date={date}
            size='medium'
            badgedDates={tasksCountByDate}
          />
        </div>
      </div>
      <Collapse in={openFilters} className='col-md-12' style={{padding: '0px', display: openFilters ? 'block' : 'none', marginBottom: openFilters ? '10px' : '0px'}}>
        <div className='col-md-12 no-side-padding flex-vertical-center'>
          <div className='col-md-1 no-left-padding sub-text italic' style={{fontSize: '12px', color: 'gray'}}>
            Statuses:
          </div>
          <div className='col-md-11 no-right-padding' style={{paddingLeft: '2px'}}>
            {
              map(getAllStatuses(), ({ icon, color, isApplied, count, label, id }) => {
                return (
                  <Chip
                    disabled={count === 0}
                    size='small'
                    key={id}
                    icon={icon}
                    label={label}
                    variant='outlined'
                    style={{
                      color: color, border: `1px solid ${color}`,
                      margin: '2px'
                    }}
                    onClick={() => toggleStatusFilter(id)}
                    onDelete={() => toggleStatusFilter(id)}
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
              map(getAllQueues(), ({id, count, isApplied, label}) => {
                return (
                  <Chip
                    disabled={count === 0}
                    key={id}
                    size='small'
                    label={label}
                    variant='outlined'
                    style={{
                      margin: '2px', border: `1px solid ${BLACK}`
                    }}
                    onClick={() => toggleQueueFilter(id)}
                    onDelete={() => toggleQueueFilter(id)}
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
          tasks={filteredTasks}
          isLoading={isLoading}
          error={error}
          onRevoke={onRevoke}
          onDownload={onDownload}
        />
      </div>
    </React.Fragment>
  );
}

export default ExistingImports;
