import React from 'react';
import { get, isArray } from 'lodash';
import { Button } from '@material-ui/core';
import FileUploader from '../common/FileUploader';
import APIService from '../../services/APIService';
import { getCurrentUserUsername } from '../../common/utils';
import Tasks from './Tasks';

class ImportHome extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      importListError: null,
      isLoadingImports: true,
    }
  }

  componentDidMount() {
    this.fetchImports()
  }

  fetchImports() {
    this.setState({isLoadingImports: true, importListError: null, tasks: []}, () => {
      APIService.new().overrideURL('/importers/bulk-import/').get(null, null, {verbose: true, username: getCurrentUserUsername()}).then(res => {
        const data = get(res, 'data')
        if(isArray(data))
          this.setState({tasks: data, isLoadingImports: false})
        else
          this.setState({importListError: res, isLoadingImports: false})
      })
    })
  }

  onRevokeTask = taskId => {
    if(taskId) {
      APIService.new().overrideURL('/importers/bulk-import/').delete({task_id: taskId}).then(() => {
        this.fetchImports()
      })
    }
  }

  render() {
    const { isLoadingImports, tasks, importListError } = this.state;
    return (
      <div className='col-md-12'>
        <div className='col-md-6'>
          <h3>New Import</h3>
          <div style={{marginTop: '-10px'}}>
            <FileUploader />
          </div>
        </div>
        <div className='col-md-6 no-left-padding' style={{marginTop: '-4px'}}>
          <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span>
              Existing Imports
            </span>
            <span>
              <Button variant='outlined' size='small' color='primary' disabled={isLoadingImports} onClick={() => this.fetchImports()}>
                Refresh
              </Button>
            </span>
          </h3>
          <div style={{marginTop: '-13px'}}>
            <Tasks tasks={tasks} isLoading={isLoadingImports} error={importListError} onRevoke={this.onRevokeTask} />
          </div>
        </div>
      </div>
    )
  }
}

export default ImportHome;
