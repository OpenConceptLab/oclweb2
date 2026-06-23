/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import alertifyjs from 'alertifyjs';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import Alert from '@mui/material/Alert';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { filter, get, includes, isEmpty, map } from 'lodash';
import APIService from '../../services/APIService';
import { formatDateTime, formatErrorForDisplay, isLoggedIn } from '../../common/utils';

const ALLOWED_EXTENSIONS = ['sql', 'zip', 'pdf', 'csv'];

const toKey = name => (name || '').replace(/\s/g, '');

const getExtension = file => {
  const name = get(file, 'name', '');
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

const getExportURL = (version, externalExport) => get(externalExport, 'url') || `${version.version_url}export/${externalExport.key}/`;
const getExternalExportRelativeURL = (version, key) => `${version.version_url}export/${key || '<key>'}/`;

const downloadBlobResponse = (response, filename) => {
  const contentType = get(response, 'headers.content-type') || get(response, 'data.type') || 'application/octet-stream';
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

const RepoExternalExports = ({ version, resource, canEdit, isHEAD, onChange, variant }) => {
  const [exports, setExports] = React.useState(get(version, 'external_exports', []));
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [file, setFile] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState({});

  React.useEffect(() => {
    setExports(get(version, 'external_exports', []));
  }, [version]);

  if(!isLoggedIn() || isHEAD)
    return null;

  const canUpload = Boolean(canEdit);
  const hasExports = !isEmpty(exports);
  if(!canUpload && !hasExports)
    return null;

  const resetForm = () => {
    setName('');
    setDescription('');
    setFile(null);
  }

  const updateExports = nextExports => {
    setExports(nextExports);
    if(onChange)
      onChange({...version, external_exports: nextExports});
  }

  const onFileChange = event => setFile(get(event, 'target.files.0') || null);

  const validate = () => {
    const key = toKey(name);
    if(!key) {
      alertifyjs.error('External export name is required.');
      return false;
    }
    if(!file) {
      alertifyjs.error('Please choose a file to upload.');
      return false;
    }
    if(includes(map(exports, 'key'), key)) {
      alertifyjs.error('External export name must be unique for this version.');
      return false;
    }
    if(!includes(ALLOWED_EXTENSIONS, getExtension(file))) {
      alertifyjs.error('External export file must be sql, zip, pdf, or csv.');
      return false;
    }
    return true;
  }

  const upload = () => {
    if(!validate())
      return;

    const key = toKey(name);
    const data = new FormData();
    data.append('file', file);
    if(description)
      data.append('description', description);

    setIsUploading(true);
    APIService.new()
      .overrideURL(`${version.version_url}export/${key}/`)
      .request('POST', data, null, {headers: {'Content-Type': 'multipart/form-data'}})
      .then(response => {
        const externalExport = get(response, 'data');
        updateExports([...exports, externalExport]);
        resetForm();
        alertifyjs.success('External export uploaded.');
      })
      .catch(error => alertifyjs.error(formatErrorForDisplay(get(error, 'response.data') || error, 'Could not upload external export.'), 5))
      .finally(() => setIsUploading(false));
  }

  const download = externalExport => {
    const key = externalExport.key;
    setIsDownloading({...isDownloading, [key]: true});
    APIService.new()
      .overrideURL(getExportURL(version, externalExport))
      .getBlob()
      .then(response => {
        if(get(response, 'status') === 200)
          downloadBlobResponse(response, externalExport.filename || key);
        else
          alertifyjs.error(formatErrorForDisplay(response, 'Could not download external export.'), 5);
      })
      .catch(error => alertifyjs.error(formatErrorForDisplay(get(error, 'response.data') || error, 'Could not download external export.'), 5))
      .finally(() => setIsDownloading({...isDownloading, [key]: false}));
  }

  const deleteExport = externalExport => {
    const key = externalExport.key;
    const confirm = alertifyjs.confirm();
    confirm.setHeader(`Delete External Export: ${key}`);
    confirm.setMessage(`Are you sure you want to permanently delete this external export from the ${resource} version?`);
    confirm.set('onok', () => {
      setIsDeleting({...isDeleting, [key]: true});
      APIService.new()
        .overrideURL(getExportURL(version, externalExport))
        .delete()
        .then(response => {
          if(get(response, 'status') === 204) {
            updateExports(filter(exports, item => item.key !== key));
            alertifyjs.success('External export deleted.');
          } else {
            alertifyjs.error(formatErrorForDisplay(response, 'Could not delete external export.'), 5);
          }
        })
        .catch(error => alertifyjs.error(formatErrorForDisplay(get(error, 'response.data') || error, 'Could not delete external export.'), 5))
        .finally(() => setIsDeleting({...isDeleting, [key]: false}));
    });
    confirm.show();
  }

  return (
    <React.Fragment>
      <Tooltip arrow title="External Exports">
        {
          variant === 'menuItem' ?
            <MenuItem onClick={() => setOpen(true)} component="li">
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}><AttachFileIcon fontSize="small" /></Box>
              External Exports
            </MenuItem> :
            <IconButton onClick={() => setOpen(true)} size="small" color={hasExports ? 'primary' : 'default'}>
              <AttachFileIcon fontSize="inherit" />
            </IconButton>
        }
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{`External Exports: ${version.short_code || version.id} / ${version.id || version.version}`}</DialogTitle>
        <DialogContent dividers>
          {
            hasExports ?
              <List dense>
                {map(exports, externalExport => {
                  const isBusy = Boolean(isDownloading[externalExport.key] || isDeleting[externalExport.key]);
                  return (
                    <ListItem key={externalExport.key} divider>
                      <ListItemText
                        primary={externalExport.key}
                        secondary={
                          <React.Fragment>
                            {externalExport.description || 'No description'}
                            {externalExport.updated_at ? ` - Updated ${formatDateTime(externalExport.updated_at)}` : ''}
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        {
                          isBusy ?
                            <CircularProgress size={18} /> :
                            <React.Fragment>
                              <Tooltip arrow title="Download">
                                <IconButton onClick={() => download(externalExport)} size="small">
                                  <DownloadIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                              {
                                canUpload &&
                                <Tooltip arrow title="Delete">
                                  <IconButton onClick={() => deleteExport(externalExport)} size="small">
                                    <DeleteIcon fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                              }
                            </React.Fragment>
                        }
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                })}
              </List> :
              <Alert severity="info">No external exports have been uploaded for this version.</Alert>
          }
          {
            canUpload &&
            <Box sx={{mt: 2}}>
              <Typography variant="subtitle2" sx={{mb: 1}}>Upload External Export</Typography>
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={name}
                helperText={`This file's relative url will be '${getExternalExportRelativeURL(version, toKey(name))}'`}
                onChange={event => setName(event.target.value)}
                sx={{mb: 1}}
              />
              <TextField
                fullWidth
                size="small"
                label="Description"
                value={description}
                onChange={event => setDescription(event.target.value)}
                sx={{mb: 1}}
              />
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Button component="label" variant="outlined" size="small" startIcon={<UploadIcon />}>
                  Choose File
                  <input hidden type="file" accept=".sql,.zip,.pdf,.csv" onChange={onFileChange} />
                </Button>
                <Typography variant="body2" color="text.secondary">{file ? file.name : 'sql, zip, pdf, csv'}</Typography>
              </Box>
            </Box>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          {
            canUpload &&
            <Button onClick={upload} disabled={isUploading} variant="contained" color="primary">
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          }
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default RepoExternalExports;
