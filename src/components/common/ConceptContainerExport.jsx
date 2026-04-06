import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  IconButton, MenuItem, Menu, Tooltip, CircularProgress, Button,
  Dialog, DialogActions, DialogContent, DialogTitle, Box
} from '@mui/material';
import {
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import { get, map } from 'lodash';
import APIService from '../../services/APIService';
import { downloadFromURL, isLoggedIn, isAdminUser } from '../../common/utils';
import { WHITE } from '../../common/constants';

// const DOWNLOAD_OPTIONS = [
//   {id: 'concepts', label: 'Concepts CSV'},
//   {id: 'mappings', label: 'Mappings CSV'},
// ]
const EXPORT_OPTION = {id: 'export', label: 'Export Version'}

class ConceptContainerExport extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      options: [],
      open: false,
      isCheckingExportExists: false,
      hasExistingExport: false,
      isProcessing: false,
      serverError: false,
      errorDetails: null,
      downloaded: false,
    }
  }

  componentDidMount() {
    const { resource, isHEAD } = this.props
    if(resource === 'source' && isHEAD && isAdminUser())
      this.setState({options: [...this.state.options, EXPORT_OPTION]})
    else if (!isHEAD && isLoggedIn())
      this.setState({options: [...this.state.options, EXPORT_OPTION]})
  }

  toggleOpen = () => this.setState({open: !this.state.open}, () => {
    if(this.state.open)
      this.checkExportExists()
  })

  getExportService() {
    const { version, isHEAD } = this.props
    let url = version.version_url
    if(isHEAD)
      url += 'HEAD/'
    return APIService.new().overrideURL(url).appendToUrl('export/')
  }


  checkExportExists() {
    this.setState(
      { isCheckingExportExists: true, serverError: false, errorDetails: null },
      async () => {
        try {
          const response = await this.getExportService().getBlob();

          this.setState({ isCheckingExportExists: false }, () => {
            const status = get(response, 'status');

            if (status === 204) {
              this.setState({
                hasExistingExport: false,
                isProcessing: false,
                downloaded: false,
              });
              return;
            }

            if (status === 208) {
              this.setState({
                isProcessing: true,
                hasExistingExport: false,
                downloaded: false,
              });
              return;
            }

            if (status === 200) {
              const contentDisposition = get(response, 'headers.content-disposition', '');
              let filename = 'export.zip';

              const filenameMatch =
                    contentDisposition.match(/filename\*=UTF-8''([^;]+)/i) ||
                    contentDisposition.match(/filename="?([^"]+)"?/i);

              if (filenameMatch && filenameMatch[1]) {
                filename = decodeURIComponent(filenameMatch[1].replace(/"/g, '').trim());
              }

              const contentType =
                    get(response, 'headers.content-type') ||
                    get(response, 'data.type') ||
                    'application/zip';

              const blob =
                    response.data instanceof Blob
                    ? response.data
                    : new Blob([response.data], { type: contentType });

              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', filename);
              document.body.appendChild(link);
              link.click();
              link.remove();

              setTimeout(() => {
                window.URL.revokeObjectURL(url);
              }, 1000);

              this.setState({
                hasExistingExport: true,
                isProcessing: false,
                serverError: false,
                errorDetails: null,
                downloaded: true,
              });
              return;
            }

            this.setState({
              serverError: true,
              errorDetails: response,
              downloaded: false,
            });
          });
        } catch (error) {
          const status = get(error, 'response.status');

          this.setState({
            isCheckingExportExists: false,
            downloaded: false,
            serverError: status === 500,
            errorDetails: get(error, 'response.data') || error,
          });
        }
      }
    );
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
      anchorEl, open, isCheckingExportExists, isProcessing, hasExistingExport,
      serverError, errorDetails, options, downloaded
    } = this.state;
    const { title, disabled, size, resource, variant } = this.props;
    return options.length === 0 ? null : (
      <React.Fragment>
        <Tooltip arrow title={title}>
          {
            variant === 'menuItem' ?
              <MenuItem
                disabled={Boolean(disabled || false)}
                onClick={() => this.handleMenuItemClick(options[0].id)}
                component='li'
              >
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}><DownloadIcon fontSize='small' /></Box>
                Export Version
              </MenuItem> :
            <IconButton onClick={() => this.handleMenuItemClick(options[0].id)} size={size || 'small'} disabled={disabled || false}>
              <DownloadIcon fontSize='inherit' />
            </IconButton>
          }
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
              {title}
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
                  {`A cached export for this ${resource} version is being generated. Check again later…`}
                </Alert>
              }
              {
                hasExistingExport && downloaded &&
                <Alert variant="filled" severity="success" style={{margin: '5px 0'}}>
                  Downloaded Export.
                </Alert>
              }
              {
                !isProcessing && !hasExistingExport && !isCheckingExportExists && !downloaded &&
                <React.Fragment>
                  <Alert variant="filled" severity="warning" style={{margin: '5px 0'}}>
                    {`There is no export cached for this ${resource} version`}
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
