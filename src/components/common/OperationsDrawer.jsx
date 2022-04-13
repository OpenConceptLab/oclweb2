import React from 'react';
import ReactJson from 'react-json-view'
import alertifyjs from 'alertifyjs';
import {
  Toolbar, Button, Drawer, IconButton, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
  CancelOutlined as CloseIcon,
  OpenInNew as NewTabIcon,
} from '@mui/icons-material';
import { get, map, includes, uniq, filter, find } from 'lodash';
import { OperationsContext } from '../app/LayoutContext';
import { getFHIRServerConfigFromCurrentContext, getAppliedServerConfig, getServerConfigsForCurrentUser } from '../../common/utils';
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
  const { setOpenOperations, operationItem } = React.useContext(OperationsContext);
  const currentServer = getAppliedServerConfig()
  const fhirServer = getFHIRServerConfigFromCurrentContext()
  const operations = uniq([...get(fhirServer, 'operations', []), ...get(currentServer, 'operations', [])])
  const [parent, setParent] = React.useState(null)

  React.useEffect(
    () => {
      setItem(operationItem)
      setCodeSystem(getItemCodeSystem(operationItem))
      setCode(getItemCode(operationItem))
      getParent(operationItem)
    },
    [operationItem]
  )

  const shouldGetParent = _item => {
    _item ||= item
    return _item && currentServer.type === 'ocl' && _item.concept_class && fhirServer
  }
  const getParent = _item => {
    _item ||= item
    if(shouldGetParent(_item)) {
      APIService.new().overrideURL(`${_item.owner_url}sources/${_item.source}/`).get().then(res => setParent(res.data))
    }
  }
  const getItemCodeSystem = (_item) => get(_item || item, 'source') || ''
  const getItemCode = (_item) => get(_item || item, 'id') || ''
  const [item, setItem] = React.useState(operationItem)
  const [codeSystem, setCodeSystem] = React.useState(getItemCodeSystem)
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
    event.preventDefault()
    event.stopPropagation()
    const isFHIROperation = includes(FHIR_OPERATIONS, operation)
    if(isFHIROperation) {
      const canonicalURL = get(parent, 'canonical_url') || get(item, 'canonical_url')
      const selectedFHIRServer = getSelectedFHIRServer()
      if(canonicalURL && selectedFHIRServer) {
        const service = APIService.new()
        const canonicalURLAttr = operation === '$lookup' ? 'system' : 'url'
        service.URL = `${selectedFHIRServer.url}${selectedFHIRServer.info.baseURI}CodeSystem/${operation}?code=${code}&${canonicalURLAttr}=${canonicalURL}`
        if(version)
          service.URL += `&version=${version}`
        service.get(null, false, null, true).then(_response => {
          if(get(_response, 'response.status') === 404) {
            setResponse(_response.response)
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

  const onOpenInNewTab = () => {
    window.open(url)
  }

  const responseLabel = isFetching ? 'Response: (fetching...)' : `Response: (status: ${get(response, 'status', 'null')})`;
  const isError = get(response, 'status') !== 200 && !isFetching

  const fhirServers = filter(getServerConfigsForCurrentUser(), {type: 'fhir'})

  const onFHIRServerChange = event => setSelectedFHIRServerId(event.target.value)

  const getSelectedFHIRServer = () => find(fhirServers, {id: selectedFHIRServerId})

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
            <h3>Operations</h3>
            <IconButton size='small' color='secondary' onClick={() => setOpenOperations(false)} style={{float: 'right'}}>
              <CloseIcon fontSize='inherit' />
            </IconButton>
          </div>
          <div className='col-xs-12 no-side-padding'>
            <div className='col-xs-12 no-side-padding'>
              <FormControl fullWidth>
                <InputLabel>FHIR Server</InputLabel>
                <Select
                  value={selectedFHIRServerId}
                  label="FHIR Server"
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
            <div className='col-xs-12 no-side-padding'>
              <h4 style={{marginBottom: '15px'}}>
                CodeSystem
              </h4>
              <div className='col-xs-8 no-left-padding'>
                <TextField fullWidth value={codeSystem} label='CodeSystem' />
              </div>
              <div className='col-xs-4 no-side-padding'>
                <TextField fullWidth value={version} label='Version' onChange={event => setVersion(event.target.value)} />
              </div>
            </div>
            <div className='col-xs-12 no-side-padding'>
              <h4 style={{marginTop: '30px', marginBottom: '15px'}}>
                Resource & Operation
              </h4>
              <div className='col-xs-6 no-left-padding'>
                <TextField value={code} label='Code' fullWidth onChange={event => setCode(event.target.value)} />
              </div>
              <div className='col-xs-6 no-side-padding'>
                <FormControl fullWidth>
                  <InputLabel>Operation</InputLabel>
                  <Select
                    value={operation}
                    label="Operation"
                    onChange={onOperationChange}
                  >
                    {
                      map(operations, _operation => {
                        return <MenuItem value={_operation} key={_operation}>{_operation}</MenuItem>
                      })
                    }
                  </Select>
                </FormControl>
              </div>
            </div>
            {
              (response || isFetching) &&
                <div className='col-xs-12 no-side-padding'>
                  <h4 style={{marginBottom: '0px', color: isError ? ERROR_RED : (isFetching ? BLACK : GREEN)}}>
                    <i>{responseLabel}</i>
                    {
                      !isFetching &&
                        <IconButton color='primary' onClick={onOpenInNewTab} size='small'>
                          <NewTabIcon fontSize='small' />
                        </IconButton>
                    }
                  </h4>
                  <div className='col-xs-12 no-side-padding'>
                    <ReactJson
                      theme='hopscotch'
                      name={false}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      src={get(response, 'data') || get(response, 'error')}
                    />
                  </div>
                </div>
            }
            <div className='col-xs-12 no-side-padding' style={{textAlign: 'right', margin: '15px 0'}}>
              <Button onClick={onExecute} variant='contained' disabled={!operation}>Execute</Button>
            </div>
          </div>
        </div>
      </Drawer>
    </React.Fragment>
  )
}

export default OperationsDrawer;
