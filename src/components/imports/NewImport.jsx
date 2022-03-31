import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Tooltip, Button, ButtonGroup, TextField, FormControlLabel, Checkbox, CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Http as URLIcon,
  Description as DocIcon
} from '@mui/icons-material';
import { Alert } from '@mui/material';
import { cloneDeep, get } from 'lodash';
import APIService from '../../services/APIService';
import { formatWebsiteLink } from '../../common/utils';
import JSONIcon from '../common/JSONIcon';
import FileUploader from '../common/FileUploader';
import { getSiteTitle } from '../../common/utils';

const SITE_TITLE = getSiteTitle()

class NewImport extends React.Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      queue: '',
      parallel: true,
      hierarchy: false,
      workers: 2,
      file: null,
      fileURL: '',
      json: '',
      type: 'upload',
      update_if_exists: true,
      isUploading: false,
    };
    this.state = cloneDeep(this.defaultState)
  }

  reset = () => this.setState(cloneDeep({...this.defaultState, type: this.state.type}))

  onTypeClick = type => this.setState({type: type})

  getButton = (type, icon, tooltip) => {
    const isSelected = this.state.type === type;
    const variant = isSelected ? 'contained' : 'outlined';
    return (
      <Tooltip arrow title={tooltip}>
        <Button variant={variant} onClick={() => this.onTypeClick(type)}>
          {icon}
        </Button>
      </Tooltip>
    )
  }

  setFieldValue = (id, value) => this.setState({[id]: value})

  onParallelToogle = event => this.setState({parallel: event.target.checked})

  canUpload() {
    const { type, fileURL, json, file } = this.state
    if(type === 'upload')
      return Boolean(file)
    if(type === 'url')
      return Boolean(fileURL)
    if(type === 'json')
      return Boolean(json)

    return false
  }

  getPayload() {
    const { type, fileURL, json, file, workers, parallel, hierarchy } = this.state
    const eligibleWorkers = hierarchy ? 1 : workers
    if(type === 'upload'){
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parallel', eligibleWorkers)
      return formData
    }
    if(type === 'url') {
      const formData = new FormData()
      formData.append('file_url', fileURL)
      formData.append('parallel', eligibleWorkers)
      return formData
    }
    if(type === 'json') {
      if(parallel) {
        const formData = new FormData()
        formData.append('parallel', eligibleWorkers)
        formData.append('data', json)
        return formData
      }
      return json
    }
  }

  getParallelService() {
    const service = APIService.new().overrideURL('/importers/bulk-import-parallel-inline/')
    if(this.state.queue)
      service.appendToUrl(`${this.state.queue}/`)
    return service
  }

  getService() {
    const { type, parallel, queue } = this.state
    if(parallel)
      return this.getParallelService()

    const service = APIService.new().overrideURL('/importers/bulk-import/')
    if(queue)
      service.appendToUrl(`${queue}/`)
    if(type === 'upload')
      service.appendToUrl('upload/')
    else if(type === 'url')
      service.appendToUrl('file-url/')

    return service
  }

  getHeaders() {
    const { type } = this.state
    if(type !== 'json')
      return {"Content-Type": "multipart/form-data"}

    return {}
  }

  onUpload = () => {
    if(this.state.parallel && (this.state.workers > 2 || this.state.workers < 1)) {
      alertifyjs.error('Parallel workers can only be 1 or 2')
      return
    }
    this.setState({isUploading: true}, () => {
      this.getService().post(this.getPayload(), null, this.getHeaders()).then(res => {
        this.setState({isUploading: false}, () => {
          setTimeout(this.props.onUploadSuccess, 2500)
          if(res.status === 202) {
            this.reset()
            alertifyjs.success('Successfully Queued!')
          }
          else
            alertifyjs.error(get(res, 'exception') || 'Failed!')
        })
      })
    })
  }

  render() {
    const { type, queue, parallel, fileURL, json, update_if_exists, isUploading, hierarchy } = this.state;
    const isUpload = type === 'upload';
    const isURL = type === 'url';
    const isJSON = type === 'json';
    const canUpload = this.canUpload();

    return (
      <React.Fragment>
        <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span>
            New Import
          </span>
          <span>
            <ButtonGroup color='secondary' size='small' disabled={isUploading}>
              { this.getButton('upload', <UploadIcon />, 'Upload JSON/CSV File') }
              { this.getButton('json', <JSONIcon />, 'Submit JSON Data') }
              { this.getButton('url', <URLIcon />, 'Paste JSON/CSV File URL') }
            </ButtonGroup>
          </span>
        </h3>
        {
          isUploading ?
          <div className='col-md-12 no-side-padding' style={{textAlign: 'center'}}>
            <CircularProgress style={{margin: '50px'}} />
          </div> :
          <div className='col-md-12 no-side-padding'>
            <div className='col-md-12 no-left-padding'>
              <TextField
                fullWidth
                size='small'
                id='queue'
                variant='outlined'
                placeholder='e.g. my-queue'
                label='Queue ID'
                value={queue}
                onChange={event => this.setFieldValue('queue', event.target.value)}
              />
              <FormHelperText style={{marginLeft: '2px'}}>
                Imports that share the same queue ID are processed in sequence
              </FormHelperText>
            </div>
            <div className='col-md-6 no-side-padding'>
              <FormControlLabel
                control={<Checkbox checked={update_if_exists} onChange={event => this.setFieldValue('update_if_exists', event.target.checked)} name='update_if_exists' />}
                label="Update Existing"
              />
              <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                Update if existing concept/mapping found
              </FormHelperText>
            </div>
            <div className='col-md-6 no-side-padding'>
              <FormControlLabel
                control={<Checkbox checked={parallel} onChange={this.onParallelToogle} name='parallel' />}
                label="Parallel"
              />
              <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                Run concepts/mappings/references imports in parallel
              </FormHelperText>
              {
                parallel &&
                <div className='col-md-12 no-side-padding'>
                  <FormControlLabel
                    control={<Checkbox checked={hierarchy} onChange={event => this.setFieldValue('hierarchy', event.target.checked)} name='hierarchy' />}
                    label="Hierarchy"
                  />
                  <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                    Important to check this if the import file has hierarchy
                  </FormHelperText>
                </div>
              }
            </div>
            <div className='col-md-12 no-side-padding' style={{margin: '10px 0'}}>
              {
                isUpload &&
                <FileUploader
                  uploadButton={false}
                  onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                  onLoading={() => this.setFieldValue('file', null)}
                  accept='application/json, application/JSON, .csv, text/comma-separated-values, text/csv, application/csv'
                />
              }
              {
                isURL &&
                <TextField
                  fullWidth
                  size='small'
                  id='fileURL'
                  type='url'
                  required
                  variant='outlined'
                  label='JSON/CSV File URL'
                  value={fileURL}
                  onChange={event => this.setFieldValue('fileURL', event.target.value)}
                />
              }
              {
                isJSON &&
                <TextField
                  multiline
                  rows={12}
                  fullWidth
                  size='small'
                  id='json'
                  type='url'
                  required
                  variant='outlined'
                  label='JSON Data'
                  value={json}
                  onChange={event => this.setFieldValue('json', event.target.value)}
                />
              }
            </div>
          </div>
        }
        <div className='col-md-12 no-side-padding' style={{textAlign: 'right'}}>
          <Button
            size='small'
            color='primary'
            variant='outlined'
            startIcon={<UploadIcon fontSize='inherit' />}
            disabled={!canUpload || isUploading}
            onClick={this.onUpload}
          >
            Upload
          </Button>
        </div>
        <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
          <Alert icon={<DocIcon fontSize='small' />} severity="info" className='flex-vertical-center'>
            <span>
              {
                `${SITE_TITLE} processes bulk import asynchronously. A bulk import may include creates, updates, or deletes for multiple owners and repositories.`
              }
              &nbsp;
              {
                formatWebsiteLink('https://docs.openconceptlab.org/en/latest/oclapi/apireference/bulkimporting.html', null, 'Read More...')
              }
            </span>
          </Alert>
        </div>
      </React.Fragment>
    )
  }
}

export default NewImport
