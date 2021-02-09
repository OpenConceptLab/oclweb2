import React from 'react';
import alertifyjs from 'alertifyjs';
import { MenuItem, Menu, Tooltip, Button } from '@material-ui/core';
import { GetApp as DownloadIcon } from '@material-ui/icons';
import { isArray, map, toUpper, includes, forEach } from 'lodash';
import APIService from '../../services/APIService';
import { downloadObject, arrayToCSV, downloadFromURL, toFullAPIURL } from '../../common/utils';

const DownloadButton = ({formats, includeCSV, resource, filename, buttonFunc, queryParams}) => {
  const fileName = filename || 'download';
  const [fetchedResources, setFetchedResources] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  let downloadableFormats = isArray(formats) ? formats : ['json', 'zip'];
  if(includeCSV && !includes(downloadableFormats, 'csv'))
    downloadableFormats.splice(1, 0, 'csv')

  const onFormatClick = format => {
    const name = `${fileName}.${format}`;
    if(format === 'json') {
      if(queryParams && isArray(resource))
        fetchAndDownloadResources()
      else
        downloadJSON(resource)
    }
    if(format === 'csv')
      downloadObject(arrayToCSV(isArray(resource) ? resource : [resource]), 'text/csv', name)
    if(format === 'zip' && resource.url)
      downloadFromURL(toFullAPIURL(resource.url) + '?format=zip', name)

    setAnchorEl(null)
  }
  const fetchAndDownloadResources = () => {
    alertifyjs.warning('Preparing Download. This might take a minute...')
    forEach(resource, object => {
      if(object.url)
        APIService.new().overrideURL(object.url)
                  .get(null, null, queryParams)
                  .then(response => setFetchedResources(prev => [...prev, response.data]))
    })
  }

  React.useEffect(
    () => {
      if(fetchedResources.length === resource.length) {
        downloadJSON(fetchedResources)
        setFetchedResources([])
      }
    },
    [fetchedResources]
  )

  const downloadJSON = objects => downloadObject(
    JSON.stringify(objects, null, 2), 'application/json', `${fileName}.json`
  )

  const tooltipTitle = `Download ${map(downloadableFormats, toUpper).join(', ')}`;

  return (
    <React.Fragment>
      <Tooltip title={tooltipTitle}>
        {
          buttonFunc ? buttonFunc({onClick: event => setAnchorEl(event.currentTarget)}) :
          <Button onClick={event => setAnchorEl(event.currentTarget)} style={{minWidth: 'unset', padding: '8px 11px', fontSize: '0.9375rem'}}>
            <DownloadIcon fontSize='inherit' style={{marginTop: '3px'}} />
          </Button>
        }
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
