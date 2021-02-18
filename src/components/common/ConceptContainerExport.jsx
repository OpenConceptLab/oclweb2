import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  IconButton, MenuItem, Menu, Tooltip, CircularProgress, Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
} from '@material-ui/core';
import {
  GetApp as DownloadIcon,
} from '@material-ui/icons';
import Alert from '@material-ui/lab/Alert';
import { get, map } from 'lodash';
import APIService from '../../services/APIService';
import { downloadFromURL } from '../../common/utils';
import { WHITE } from '../../common/constants';

const DOWNLOAD_OPTIONS = [
  {id: 'concepts', label: 'Concepts CSV'},
  {id: 'mappings', label: 'Mappings CSV'},
]
const EXPORT_OPTION = {id: 'export', label: 'Export Version'}

class ConceptContainerExport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      options: [...DOWNLOAD_OPTIONS],
      open: false,
      isCheckingExportExists: false,
      hasExistingExport: false,
      isProcessing: false,
      exportURL: null,
      serverError: false,
      errorDetails: null,
    }
  }

  componentDidMount() {
    if(!this.props.isHEAD)
      this.setState({options: [...this.state.options, EXPORT_OPTION]})
  }

  toggleOpen = () => this.setState({open: !this.state.open}, () => {
    if(this.state.open)
      this.checkExportExists()
  })

  getExportService() {
    const { version } = this.props
    return APIService.new().overrideURL(version.version_url).appendToUrl('export/')
  }

  checkExportExists() {
    this.setState({isCheckingExportExists: true, serverError: false, errorDetails: false}, () => {
      this.getExportService().get(null, null, {noRedirect: true}, true).then(response => {
        this.setState({isCheckingExportExists: false}, () => {
          if(get(response, 'status') === 204) {
            this.setState({hasExistingExport: false, isProcessing: false, exportURL: null})
            return
          }
          if(get(response, 'status') === 208) {
            this.setState({isProcessing: true, hasExistingExport: false, exportURL: null})
            return
          }
          if(get(response, 'status') === 200) {
            this.setState({hasExistingExport: true, isProcessing: false, exportURL: get(response, 'data.url'), serverError: false, errorDetails: null})
            return
          }

          //Error
          const res = get(response, 'response')
          const status = get(res, 'status')
          if(status === 500) {
            this.setState({serverError: true, errorDetails: get(res, 'data')})
            return
          }
        })
      })
    })
  }

  toggleAnchorEl = event => this.setState({
    anchorEl: this.state.anchorEl ? null : event.currentTarget
  })

  handleMenuItemClick(option) {
    if(option === 'export')
      this.toggleOpen()
    else if(option)
      this.downloadCSV(option)
  }

  queueExport() {
    const alertify = alertifyjs.warning('Queuing export...')
    this.getExportService().post(null, null, null, {noRedirect: true}, true).then(response => {
      alertify.dismiss()
      const status = get(response, 'status') || get(response, 'response.status');
      if(status) {
        this.toggleOpen()
        this.toggleAnchorEl()
        if(status === 204) {
          alertifyjs.success('An export already exists for this version. Please try to download that.', 3);
          return
        }
        if(status === 202) {
          alertifyjs.success('Export is queued. Please try downloading it after some time.', 3);
          return
        }
        if(status === 409) {
          alertifyjs.success('Export is already in queue. Please wait for some time till its processing..', 3);
          return
        }
        alertifyjs.error(`Something bad happened. Status: ${status}.`)
      }
    })
  }

  downloadCSV(type) {
    const { version } = this.props;
    const url = type === 'concepts' ? version.concepts_url : version.mappings_url
    if(url) {
      alertifyjs.warning('Requesting CSV. This may take few seconds...')
      APIService.new().overrideURL(url).get(null, null, {csv: true, limit: 1000}).then(response => {
        if(get(response, 'status') === 200) {
          const url = response.data.url
          if(url) {
            this.toggleAnchorEl()
            downloadFromURL(url, `${type}.zip`)
            return
          }
        }
        alertifyjs.error('Could not download CSV.')
      })
    }
  }

  render() {
    const {
      anchorEl, open, isCheckingExportExists, isProcessing, hasExistingExport, exportURL,
      serverError, errorDetails, options
    } = this.state;
    const { version, title } = this.props;
    return (
      <React.Fragment>
        <Tooltip title={title}>
          <IconButton onClick={this.toggleAnchorEl}>
            <DownloadIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
        {
          Boolean(anchorEl) &&
          <Menu
            anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={this.toggleAnchorEl}>
            {
              map(options, option => (
                <MenuItem key={option.id} onClick={() => this.handleMenuItemClick(option.id)}>
                  {option.label}
                </MenuItem>
              ))
            }
          </Menu>
        }
        {
          open &&
          <Dialog open={open} onClose={this.toggleOpen} maxWidth="sm" fullWidth>
            <DialogTitle>
              {`Export Version: ${version.id}`}
            </DialogTitle>
            <DialogContent>
              {
                isCheckingExportExists &&
                <React.Fragment>
                  <Alert variant="filled" severity="warning" style={{margin: '5px 0'}}>
                    <span style={{marginRight: '10px'}}>
                      Checking for existing export
                    </span>
                    <CircularProgress style={{width: '16px', height: '16px', color: WHITE}} />
                  </Alert>
                </React.Fragment>
              }
              {
                isProcessing &&
                <Alert variant="filled" severity="warning" style={{margin: '5px 0'}}>
                  This version is currently in processing...
                </Alert>
              }
              {
                hasExistingExport && exportURL &&
                <Alert variant="filled" severity="success" style={{margin: '5px 0'}}>
                  Please <a href={exportURL} target='_blank' rel="noopener noreferrer"><b>Click here</b></a> to download the export.
                </Alert>
              }
              {
                !isProcessing && !hasExistingExport && !isCheckingExportExists && !exportURL &&
                <React.Fragment>
                  <Alert variant="filled" severity="warning" style={{margin: '5px 0'}}>
                    There is no existing export found for this version.
                  </Alert>
                  <div style={{marginTop: '15px', padding: '0 10px'}}>
                    <h3 style={{display: 'contents'}}>Click here to queue a new export</h3>
                    <Button
                      onClick={() => this.queueExport()}
                      size='small' variant='contained' color='primary' style={{marginLeft: '15px'}}>
                      Queue Export
                    </Button>
                  </div>
                </React.Fragment>
              }
              {
                serverError &&
                <React.Fragment>
                  <Alert variant="filled" severity="error" style={{margin: '5px 0'}}>
                    Something unexpected happened!.
                  </Alert>
                  {
                    errorDetails &&
                    <details style={{marginTop: '15px'}}>
                      <summary>Error Details</summary>
                      <pre>{errorDetails}</pre>
                    </details>
                  }
                </React.Fragment>
              }
            </DialogContent>
            <DialogActions>
              <Button onClick={this.toggleOpen}>Ok</Button>
            </DialogActions>
          </Dialog>
        }
      </React.Fragment>
    )
  }
}

export default ConceptContainerExport;
