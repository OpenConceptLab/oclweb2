import React from 'react';
import ReactJson from 'react-json-view'
import alertifyjs from 'alertifyjs';
import {
  Toolbar, Button, Drawer, IconButton, TextField, FormControl, InputLabel, Select, MenuItem,
  ButtonGroup
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  CancelOutlined as CloseIcon,
  OpenInNew as NewTabIcon,
  FileCopy as CopyIcon,
} from '@mui/icons-material';
import { get, map, includes, uniq, filter, find, startCase, isString, isObject } from 'lodash';
import { OperationsContext } from '../app/LayoutContext';
import {
  getFHIRServerConfigFromCurrentContext, getAppliedServerConfig, getServerConfigsForCurrentUser, copyURL
} from '../../common/utils';
import { FHIR_OPERATIONS, GREEN, ERROR_RED, BLACK } from '../../common/constants';
import APIService from '../../services/APIService';

const drawerWidth = 350;
const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 0,
  },
  hide: {
    display: 'none',
  },
  drawerContainer: {
    overflow: 'auto',
    padding: '0 10px'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    zIndex: 1202
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    height: '65px',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));


const OperationsDrawer = () => {
  const classes = useStyles();
  const { setOpenOperations, operationItem, parentResource, parentItem } = React.useContext(OperationsContext);
  const currentServer = getAppliedServerConfig()
  const fhirServer = getFHIRServerConfigFromCurrentContext()
  let containerResource = parentResource || 'source'
  const fhirResource = parentResource === 'source' ? 'codeSystem' : 'valueSet'
  const fhirResourceDisplay = startCase(fhirResource).replace(' ', '')
  const operations = uniq([...get(fhirServer, `operations.${fhirResource}`, []), ...get(currentServer, `operations.${containerResource}`, [])])
  const [byURL, setByURL] = React.useState(false)

  React.useEffect(
    () => {
      setItem(operationItem)
      setVersion(get(operationItem, 'parentVersion') || 'HEAD')
      setParentId(getParentId(operationItem))
      setCode(getItemCode(operationItem))
      if(!parentItem)
        getParent(operationItem)
    },
    [operationItem]
  )

  React.useEffect(
    () => {
      if(parentItem)
        setCanonicalURL(parentItem.canonical_url || '')
    },
    [parentItem]
  )

  const shouldGetParent = _item => {
    _item ||= item
    return _item && currentServer.type === 'ocl' && _item.concept_class && fhirServer
  }
  const getParent = _item => {
    _item ||= item
    if(shouldGetParent(_item)) {
      APIService.new().overrideURL(`${_item.owner_url}sources/${_item.source}/`).get().then(res => {
        setCanonicalURL(get(res.data, 'canonical_url') || '')
      })
    }
  }
  const getParentId = _item => {
    if(parentItem)
      return parentItem.id
    return get(_item || item, 'source') || ''
  }
  const getItemCode = _item => get(_item || item, 'id') || ''
  const [item, setItem] = React.useState(operationItem)
  const [parentId, setParentId] = React.useState(getParentId)
  const [canonicalURL, setCanonicalURL] = React.useState(get(operationItem, 'canonical_url') || '')
  const [systemURL, setSystemURL] = React.useState('')
  const [systemVersion, setSystemVersion] = React.useState('')
  const [code, setCode] = React.useState(getItemCode)
  const [version, setVersion] = React.useState('HEAD')
  const [operation, setOperation] = React.useState('');
  const [response, setResponse] = React.useState(null);
  const [url, setURL] = React.useState(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedFHIRServerId, setSelectedFHIRServerId] = React.useState(get(fhirServer, 'id', ''))
  const onOperationChange = event => setOperation(event.target.value)
  const onExecute = event => {
    setIsFetching(true)
    setResponse(null)
    event.preventDefault()
    event.stopPropagation()
    const isFHIROperation = includes(FHIR_OPERATIONS, operation)
    if(isFHIROperation) {
      const selectedFHIRServer = getSelectedFHIRServer()
      if(canonicalURL && selectedFHIRServer) {
        const service = APIService.new()
        const canonicalURLAttr = operation === '$lookup' ? 'system' : 'url'
        service.URL = `${selectedFHIRServer.url}${selectedFHIRServer.info.baseURI}${fhirResourceDisplay}/${operation}/?code=${code}&${canonicalURLAttr}=${canonicalURL}`
        if(version && version.toLowerCase() !== 'head' && !byURL)
          service.URL += `&version=${version}`
        if(operation === '$validate-code') {
          if(systemURL)
            service.URL += `&system=${systemURL}`
          if(systemVersion)
            service.URL += `&systemVersion=${systemVersion}`
        }
        service.get(null, false, null, true).then(_response => {
          if(get(_response, 'response.status') >= 400) {
            setResponse(get(_response, 'response'))
          } else {
            setResponse(_response)
          }
          setURL(_response.config.url)
          setIsFetching(false)
        })
      } else {
        if(!selectedFHIRServer)
          alertifyjs.error('No FHIR Server found associated to this OCL server.')
        else
          alertifyjs.error('No canonical_url found.')
        setIsFetching(false)
        setResponse(null)
        setURL(null)
      }
    } else {
      APIService.new().overrideURL(item.url).appendToUrl(`${operation}/`).get().then(
        _response => {
          setURL(_response.config.url)
          setResponse(_response)
          setIsFetching(false)
        }
      )
    }
  }

  const onOpenInNewTab = () => window.open(url)
  const onCopyURLClick = () => copyURL(url)
  const responseLabel = isFetching ? 'Response: (fetching...)' : `Response: (status: ${get(response, 'status', 'null')})`;
  const isError = get(response, 'status') !== 200 && !isFetching
  const fhirServers = filter(getServerConfigsForCurrentUser(), {type: 'fhir'})
  const onFHIRServerChange = event => setSelectedFHIRServerId(event.target.value)
  const getSelectedFHIRServer = () => find(fhirServers, {id: selectedFHIRServerId})
  const toggleByURL = _byURL => {
    if(_byURL && operation === '$cascade')
      setOperation('')
    setByURL(_byURL)
  }

  const getResponse = () => {
    let data = get(response, 'data') || get(response, 'error')
    if(isString(data))
      return {response: data}
    if(isObject(data))
      return data
    return response
  }

  return (
    <React.Fragment>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open
        classes={{paper: classes.drawerPaper,}}
        onClose={() => setOpenOperations(false)}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <div style={{justifyContent: 'space-between', display: 'flex', alignItems: 'center'}}>
            <h3>Operations (Beta)</h3>
            <IconButton size='small' color='secondary' onClick={() => setOpenOperations(false)} style={{float: 'right'}}>
              <CloseIcon fontSize='inherit' />
            </IconButton>
          </div>
          <div className='col-xs-12 no-side-padding'>
            <div className='col-xs-12 no-side-padding' style={{textAlign: 'center', marginBottom: '20px'}}>
              <ButtonGroup size='small'>
                <Button variant={byURL ? 'outlined' : 'contained'} onClick={() => toggleByURL(false)}>
                  Find Resource
                </Button>
                <Button variant={byURL ? 'contained' : 'outlined'} onClick={() => toggleByURL(true)}>
                  Enter URL
                  </Button>
                </ButtonGroup>
            </div>
            <div className='col-xs-12 no-side-padding'>
              <FormControl fullWidth>
                <InputLabel>Server Base URL</InputLabel>
                <Select
                  value={selectedFHIRServerId}
                  label="Server Base URL"
                  onChange={onFHIRServerChange}
                >
                  {
                    map(fhirServers, server => {
                      return <MenuItem value={server.id} key={server.id}>{`${server.name} (${server.url})`}</MenuItem>
                    })
                  }
                </Select>
              </FormControl>
            </div>
            {
              byURL ?
                <div className='col-xs-12 no-side-padding'>
                  <div className='col-xs-12 no-side-padding'>
                  <h4 style={{marginBottom: '15px'}}>
                    Canonical URL
                  </h4>
                  <div className='col-xs-12 no-left-padding'>
                    <TextField fullWidth value={canonicalURL} label='CanonicalURL' onChange={event => setCanonicalURL(event.target.value || '')} size='small' />
                  </div>
                  </div>
                  {
                    operation === '$validate-code' &&
                      <React.Fragment>
                      <div className='col-xs-12 no-side-padding'>
                        <h4 style={{marginBottom: '15px'}}>
                          System URL
                        </h4>
                        <div className='col-xs-12 no-left-padding'>
                          <TextField fullWidth value={systemURL} label='SystemURL' onChange={event => setSystemURL(event.target.value || '')} size='small' />
                        </div>
                      </div>
                        <div className='col-xs-12 no-side-padding'>
                          <h4 style={{marginBottom: '15px'}}>
                            System Version
                          </h4>
                          <div className='col-xs-12 no-left-padding'>
                            <TextField fullWidth value={systemVersion} label='SystemVersion' onChange={event => setSystemVersion(event.target.value || '')} size='small' />
                          </div>
                        </div>
                        </React.Fragment>
                  }
                </div> :
              <div className='col-xs-12 no-side-padding'>
                <h4 style={{marginBottom: '15px'}}>
                  {fhirResourceDisplay}
                </h4>
                <div className='col-xs-8 no-left-padding'>
                  <TextField fullWidth value={parentId} label={fhirResourceDisplay} size='small' />
                </div>
                <div className='col-xs-4 no-side-padding'>
                  <TextField fullWidth value={version} label='Version' onChange={event => setVersion(event.target.value)} size='small' />
                </div>
              </div>
            }
            <div className='col-xs-12 no-side-padding'>
              <h4 style={{marginTop: '30px', marginBottom: '15px'}}>
                Resource & Operation
              </h4>
              <div className='col-xs-6 no-left-padding'>
                <TextField value={code} label='Code' fullWidth onChange={event => setCode(event.target.value)} size='small' />
              </div>
              <div className='col-xs-6 no-side-padding'>
                <FormControl fullWidth>
                  <InputLabel>Operation</InputLabel>
                  <Select
                    value={operation}
                    label="Operation"
                    onChange={onOperationChange}
                    size='small'
                  >
                    {
                      map(operations, _operation => {
                        return <MenuItem size='small' value={_operation} key={_operation} disabled={byURL && _operation === '$cascade'}>{_operation}</MenuItem>
                      })
                    }
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className='col-xs-12 no-side-padding' style={{textAlign: 'right', margin: '15px 0'}}>
              <Button onClick={onExecute} variant='contained' disabled={!operation}>Execute</Button>
            </div>
            {
              (response || isFetching) &&
                <div className='col-xs-12 no-side-padding'>
                  <h4 style={{margin: 0, color: isError ? ERROR_RED : (isFetching ? BLACK : GREEN)}}>
                    <i>{responseLabel}</i>
                    {
                      !isFetching &&
                        <React.Fragment>
                        <IconButton color='primary' onClick={onOpenInNewTab} size='small'>
                          <NewTabIcon fontSize='small' />
                        </IconButton>
                          <IconButton onClick={onCopyURLClick} size='small'>
                            <CopyIcon fontSize='inherit' />
                          </IconButton>
                        </React.Fragment>
                    }
                  </h4>
                  <div className='col-xs-12 no-side-padding'>
                    <ReactJson
                      theme='hopscotch'
                      name={false}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      src={getResponse() || {}}
                      style={{overflow: 'auto'}}
                    />
                  </div>
                </div>
            }
          </div>
        </div>
      </Drawer>
    </React.Fragment>
  )
}

export default OperationsDrawer;
