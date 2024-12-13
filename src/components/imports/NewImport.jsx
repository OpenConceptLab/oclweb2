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
import OwnerSelection from "../common/OwnerSelection";

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
      owner: {type: 'User'},
      npmPackageName: '',
      npmPackageVersion: '',
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

  canUpload() {
    const { type, fileURL, npmPackageName, npmPackageVersion, json, file } = this.state
    if(type === 'upload')
      return Boolean(file)
    if(type === 'url')
      return Boolean(fileURL)
    if(type === 'npm')
      return (Boolean(npmPackageName) && Boolean(npmPackageVersion)) || Boolean(file)
    if(type === 'json')
      return Boolean(json)

    return false
  }

  getPayload() {
    const { type, fileURL, npmPackageName, npmPackageVersion, owner, json, file, workers, hierarchy } = this.state
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
      const formData = new FormData()
      formData.append('parallel', eligibleWorkers)
      formData.append('data', json)
      return formData
    }
    if(type === 'npm') {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      } else {
        formData.append('file_url', 'https://packages.simplifier.net/' + npmPackageName + '/' +
            npmPackageVersion)
      }
      formData.append('import_type', 'npm')
      formData.append('owner_type', owner.type)
      if(owner.type === 'User') {
        formData.append('owner', owner.username)
      } else {
        formData.append('owner', owner.id)
      }

      return formData
    }
  }

  getService() {
    let service = APIService.new().overrideURL('/importers/bulk-import-parallel-inline/')
    if (this.state.type === 'npm') {
      service = APIService.new().overrideURL('/importers/bulk-import/')
    }
    if(this.state.queue)
      service.appendToUrl(`${this.state.queue}/`)
    return service
  }

  getHeaders() {
    const { type } = this.state
    if(type !== 'json')
      return {"Content-Type": "multipart/form-data"}

    return {}
  }

  onUpload = () => {
    if(this.state.workers > 2 || this.state.workers < 1) {
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
    const { type, queue, fileURL, npmPackageName, npmPackageVersion,
      json, update_if_exists, isUploading, hierarchy } = this.state;
    const isUpload = type === 'upload';
    const isURL = type === 'url';
    const isJSON = type === 'json';
    const isNPM = type === 'npm';
    const canUpload = this.canUpload();

    return (
      <React.Fragment>
        <h3 style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span>
            New Import
          </span>
          <span>
            <ButtonGroup color='secondary' size='small' disabled={isUploading}>
              { this.getButton('upload', <UploadIcon />, 'Upload JSON/CSV/ZIP File') }
              { this.getButton('json', <JSONIcon />, 'Submit JSON Data') }
              { this.getButton('url', <URLIcon />, 'Paste JSON/CSV/ZIP File URL') }
              { this.getButton('npm', <div>NPM</div>, 'NPM package import')}
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
            {!isNPM &&
                <div className='col-md-6 no-side-padding'>
                  <FormControlLabel
                      control={<Checkbox checked={update_if_exists}
                                         onChange={event => this.setFieldValue('update_if_exists', event.target.checked)}
                                         name='update_if_exists'/>}
                      label="Update Existing"
                  />
                  <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                    Update if existing concept/mapping found
                  </FormHelperText>
                </div>
            }
            {!isNPM &&
                <div className='col-md-6 no-side-padding'>
                  <div className='col-md-12 no-side-padding'>
                    <FormControlLabel
                        control={<Checkbox checked={hierarchy}
                                           onChange={event => this.setFieldValue('hierarchy', event.target.checked)}
                                           name='hierarchy'/>}
                        label="Hierarchy"
                    />
                    <FormHelperText style={{marginTop: '-5px', marginLeft: '2px'}}>
                      Important to check this if the import file has hierarchy
                    </FormHelperText>
                  </div>
                </div>
            }
            <div className='col-md-12 no-side-padding' style={{margin: '10px 0'}}>
              {
                isUpload &&
                <FileUploader
                  uploadButton={false}
                  onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                  onLoading={() => this.setFieldValue('file', null)}
                  accept='application/json, application/JSON, .csv, text/comma-separated-values, text/csv, application/csv, application/zip, text/zip, .zip'
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
                  label='JSON/CSV/ZIP File URL'
                  value={fileURL}
                  onChange={event => this.setFieldValue('fileURL', event.target.value)}
                />
              }
              {
                isNPM && <div>
                    <div className='col-md-12 no-side-padding'>
                      <OwnerSelection
                        onChange={newOwner => this.setFieldValue('owner', newOwner)}
                        disabled={false} />
                      <FormHelperText style={{marginLeft: '2px'}}>
                        Determines the namespace where the imported resources should be created
                      </FormHelperText>
                    </div>
                    <div className='col-md-12 no-side-padding' style={{marginTop: '10px'}}>
                      Provide NPM package name and version to be fetched from <a href="https://registry.fhir.org/">FHIR package registry</a>:
                    </div>
                    <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginLeft: '10px', marginBottom: '10px', marginTop: '10px'}}>
                      <div className='col-md-6 no-left-padding'>
                        <TextField
                          fullWidth
                          size='small'
                          id='npmPackageName'
                          type='text'
                          variant='outlined'
                          label='NPM package name'
                          value={npmPackageName}
                          onChange={event => this.setFieldValue('npmPackageName', event.target.value)}
                        />
                      </div>
                      <div className='col-md-6 no-side-padding'>
                        <TextField
                          fullWidth
                          size='small'
                          id='npmPackageVersion'
                          type='text'
                          variant='outlined'
                          label='NPM package version'
                          value={npmPackageVersion}
                          onChange={event => this.setFieldValue('npmPackageVersion', event.target.value)}
                        />
                      </div>
                    </div>
                    <div className='col-md-12 no-side-padding'>
                      Or upload a package file:
                    </div>
                    <div className='col-md-12 no-side-padding' style={{marginLeft: '10px', marginBottom: '10px'}}>
                      <FileUploader
                          uploadButton={false}
                          onUpload={uploadedFile => this.setFieldValue('file', uploadedFile)}
                          onLoading={() => this.setFieldValue('file', null)}
                          accept='application/zip, text/zip, .zip, application/gzip, application/tar+gzip, .tar.gz, .tgz'
                      />
                    </div>
                  </div>
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
