import React from 'react';
import './FileUploader.scss'
import { useDropzone } from 'react-dropzone';
import { isEmpty } from 'lodash';
import { Button } from '@material-ui/core';
import { CloudUpload as UploadIcon } from '@material-ui/icons'
import { humanFileSize } from '../../common/utils';
import LinearProgressWithLabel from './LinearProgressWithLabel';


const FileUploader = ({ maxFiles, accept, uploadButton, onUpload, onLoading }) => {
  const maxAllowedFiles = maxFiles || 1;
  const [progress, setProgress] = React.useState(0);
  const [canUpload, setCanUpload] = React.useState(false);

  const onDrop = acceptedFiles => {
    setCanUpload(false);
    if(onLoading)
      onLoading()

    const formData = new FormData();
    for (const file of acceptedFiles) formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = event => {
      const percentage = parseInt((event.loaded / event.total) * 100);
      setProgress(percentage)
      if(percentage === 100)
        onUpload(acceptedFiles[0])
    };
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        setCanUpload(true);
      }
    };
    xhr.open('POST', 'https://httpbin.org/post', true);
    xhr.send(formData);
  }

  const {
    acceptedFiles, fileRejections, getRootProps, getInputProps
  } = useDropzone({
    maxFiles: maxAllowedFiles,
    accept: accept || 'application/json',
    onDrop: onDrop,
  })

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
          <em>(only *.json file will be accepted)</em>
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
