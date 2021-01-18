import React from 'react';
import { MenuItem, Menu, Tooltip, Button } from '@material-ui/core';
import { GetApp as DownloadIcon } from '@material-ui/icons';
import { isArray, map, toUpper } from 'lodash';
import { downloadObject, arrayToCSV, downloadFromURL, toFullAPIURL } from '../../common/utils';

const DownloadButton = ({formats, includeCSV, resource, filename}) => {
  const fileName = filename || 'download';
  const [anchorEl, setAnchorEl] = React.useState(null);
  let downloadableFormats = isArray(formats) ? formats : ['json', 'zip'];
  if(includeCSV)
    downloadableFormats.splice(1, 0, 'csv')

  const onFormatClick = format => {
    const name = `${fileName}.${format}`;
    if(format === 'json')
      downloadObject(JSON.stringify(resource, null, 2), 'application/json', name)
    if(format === 'csv')
      downloadObject(arrayToCSV([resource]), 'text/csv', name)
    if(format === 'zip' && resource.url)
      downloadFromURL(toFullAPIURL(resource.url) + '?format=zip', name)

    setAnchorEl(null)
  }
  const tooltipTitle = `Download ${map(downloadableFormats, toUpper).join(', ')}`;

  return (
    <React.Fragment>
      <Tooltip title={tooltipTitle}>
        <Button onClick={event => setAnchorEl(event.currentTarget)} style={{minWidth: 'unset', padding: '8px 11px', fontSize: '0.9375rem'}}>
          <DownloadIcon fontSize='inherit' style={{marginTop: '3px'}} />
        </Button>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {
          map(downloadableFormats, format => (
            <MenuItem key={format} onClick={() => onFormatClick(format)} style={{fontSize: '0.8rem'}}>
              {format.toUpperCase()}
            </MenuItem>
          ))
        }
      </Menu>
    </React.Fragment>
  );
}

export default DownloadButton;
