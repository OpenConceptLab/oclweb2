import React from 'react';
import { get, isArray, forEach, filter, find, reject, orderBy, includes } from 'lodash';
import { Paper } from '@mui/material';
import APIService from '../../services/APIService';
import { getCurrentUserUsername, downloadObject } from '../../common/utils';
import NewImport from './NewImport';
import ExistingImports from './ExistingImports';

class ImportHome extends React.Component {
  constructor(props) {
    super(props)
    this.service = APIService.new().overrideURL('/importers/bulk-import/')
    this.state = {
      intervals: [],
      tasks: [],
      importListError: null,
      isLoadingImports: true,
    }
  }

  componentDidMount() {
    this.fetchImports()
  }

  fetchImports() {
    this.stopAllPolling()
    this.setState({isLoadingImports: true, importListError: null, tasks: [], intervals: []}, () => {
      this.service.get(null, null, {verbose: true, username: getCurrentUserUsername()})
          .then(res => {
            const data = get(res, 'data')
            if(isArray(data))
              this.setState({tasks: orderBy(data, 'details.received', 'desc'), isLoadingImports: false}, () => {
                this.queryStartedTasks(filter(this.state.tasks, task => includes(['STARTED', 'RECEIVED'], task.state)))
              })
            else
              this.setState({importListError: res, isLoadingImports: false})
          })
    })

  }

  stopPoll(taskId) {
    clearInterval(get(find(this.state.intervals, {id: taskId}), 'interval'))
    this.setState({intervals: reject(this.state.intervals, {id: taskId})})
  }

  stopAllPolling() {
    forEach(this.state.intervals, interval => clearInterval(interval.interval))
  }

  updateTaskStatus(task, newStatus) {
    const newState = {...this.state}
    const existingTask = find(newState.tasks, {task: task.task})
    existingTask.state = newStatus
    if(existingTask.details)
      existingTask.details.state = newStatus
    this.setState(newState)
  }

  fetchStartedTaskUpdates(task) {
    return setInterval(() => {
      this.service.get(null, null, {task: task.task}).then(res => {
        const data = get(res, 'data')
        if(data) {
          if(task.state === 'RECEIVED' && data.state === 'REVOKED') {
            this.stopPoll(task.task)
            this.updateTaskStatus(task, 'REVOKED')
          }
          else if(data.state !== task.state) {
            this.stopPoll(task.task)
            this.fetchImports()
          } else if (data.details) {
            const newState = {...this.state}
            const existingTask = find(this.state.tasks, {task: task.task})
            existingTask.result = data.details
            this.setState(newState)
          }
        } else {
          this.stopPoll(task.task)
          this.fetchImports()
        }
      })
    }, 5000)
  }

  queryStartedTasks(startedTasks) {
    forEach(startedTasks, task => {
      const newInterval = {id: task.task, interval: this.fetchStartedTaskUpdates(task)}
      this.setState({intervals: [...this.state.intervals, newInterval]})
    })
  }

  onRevokeTask = taskId => {
    if(taskId) {
      const task = find(this.state.tasks, {task: taskId})
      const children = get(task, 'details.children') || [];
      forEach(children, childTaskId => {
        APIService.new().overrideURL('/importers/bulk-import/').delete({task_id: childTaskId}).then(() => {})
      })

      APIService.new().overrideURL('/importers/bulk-import/').delete({task_id: taskId}).then(() => {
        this.stopPoll(task);
        task.state === 'RECEIVED' ? this.updateTaskStatus(task, 'REVOKED') : this.fetchImports()
      })
    }
  }

  onDownloadTask = taskId => {
    if(taskId) {
      APIService.new().overrideURL('/importers/bulk-import/').get(null, null, {task: taskId, result: 'json'}).then(res => {
        if(get(res, 'data')) {
          downloadObject(JSON.stringify(res.data, undefined, 2), 'application/json', `${taskId}.json`)
        }
      })
    }
  }

  render() {
    const { isLoadingImports, tasks, importListError } = this.state;
    const PAPER_STYLES = {padding: '0 10px 10px 10px', display: 'inline-block', width: '100%', margin: '10px 0'}
    return (
      <div className='col-md-12'>
        <div className='col-md-12 no-side-padding'>
          <div className='col-md-6 no-left-padding'>
            <Paper style={PAPER_STYLES}>
              <NewImport onUploadSuccess={() => this.fetchImports()} />
            </Paper>
          </div>
          <div className='col-md-6 no-side-padding'>
            <Paper style={PAPER_STYLES}>
              <ExistingImports
                tasks={tasks}
                isLoading={isLoadingImports}
                onRefresh={() => this.fetchImports()}
                onRevoke={this.onRevokeTask}
                onDownload={this.onDownloadTask}
                error={importListError}
              />
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}

export default ImportHome;
