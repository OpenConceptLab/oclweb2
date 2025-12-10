import React from 'react';
import './FileUploader.scss'
import { useDropzone } from 'react-dropzone';
import { isEmpty, last, uniq } from 'lodash';
import { Button } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material'
import { humanFileSize, arrayToSentence } from '../../common/utils';
import LinearProgressWithLabel from './LinearProgressWithLabel';


const FileUploader = ({ maxFiles, accept, uploadButton, onUpload, onLoading, maxSize }) => {
  const maxAllowedFiles = maxFiles || 1;
  const [progress, setProgress] = React.useState(0);
  const [canUpload, setCanUpload] = React.useState(false);

  const onDrop = acceptedFiles => {
    setCanUpload(false);
    if (onLoading) onLoading();

    // Fake progress animation (0 → 100)
    let pct = 0;
    const interval = setInterval(() => {
      pct += 10;
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setCanUpload(true);
        onUpload(acceptedFiles[0]);
      }
    }, 80);
  };

  const {
    acceptedFiles, fileRejections, getRootProps, getInputProps
  } = useDropzone({
    maxSize: maxSize || 95 * 1024 * 1024,
    maxFiles: maxAllowedFiles,
    accept: accept || 'application/json',
    onDrop: onDrop,
  })

  const acceptedExtensions = accept ? uniq(accept.split(',').map(ext => last(ext.split('/')).toLowerCase())) : ['json']
  const acceptedExtensionFormatsLabel = arrayToSentence(acceptedExtensions, ', ', ' or ');

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {humanFileSize(file.size, true)}
    </li>
  ));
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {humanFileSize(file.size, true)}
      <ul>
        {errors.map(e => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  return (
    <div className='file-uploader-main-container'>
      <section className="file-uploader-container">
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <p>Drag and drop file here, or click to select file</p>
          <em>
            {
              `(only ${acceptedExtensionFormatsLabel} file will be accepted)`
            }
          </em>
        </div>
        <LinearProgressWithLabel progress={progress} />
        <aside>
          <h4>Files</h4>
          <ul>{files}</ul>
          {
            !isEmpty(fileRejectionItems) &&
            <React.Fragment>
              <h4>Rejected files</h4>
              <ul>{fileRejectionItems}</ul>
            </React.Fragment>
          }
        </aside>
        {
          uploadButton &&
          <div className='col-md-12 no-side-padding' style={{textAlign: 'right'}}>
            <Button
              size='small'
              color='primary'
              variant='outlined'
              startIcon={<UploadIcon fontSize='inherit' />}
              disabled={!canUpload}>
              Upload
            </Button>
          </div>
        }
      </section>
    </div>
  );
}

export default FileUploader;
