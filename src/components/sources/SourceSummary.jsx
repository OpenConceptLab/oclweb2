import React from 'react';
import { Table, TableHead, TableCell, TableBody, TableRow, TableContainer, Paper, Tooltip, Collapse, Button, Divider, List, ListItem, CircularProgress, Chip } from '@mui/material'
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import { map, max, isEmpty, get } from 'lodash';
import { TOMATO_RED, BLUE, WHITE } from '../../common/constants';
import { toNumDisplay } from '../../common/utils';
import APIService from '../../services/APIService';
import PopperGrow from '../common/PopperGrow';


const FieldDistribution = ({distribution, field}) => {
  return distribution ?
    (
      <List dense>
        {
          map(distribution, state => (
            <ListItem key={state[field]} secondaryAction={toNumDisplay(state.count)}>
              {state[field]}
            </ListItem>
          ))
        }
      </List>
    ) : (
      <div style={{textAlign: 'center', padding: '10px'}}>
        <CircularProgress />
      </div>
    )
}


const SummaryTable = ({ summary, retired, colls }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <React.Fragment>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <a href={'#' + summary.version_url} target='_blank' rel='noreferrer noopener'>
            {summary.short_code}
          </a>
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.concepts)}
        </TableCell>
        {
          retired &&
            <TableCell align='right'>
              {toNumDisplay(summary.distribution.retired)}
            </TableCell>
        }
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.active)}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.total)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={colls} align='left' style={{cursor: 'pointer', padding: 0}} onClick={() => setOpen(!open)}>
          <Button
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            startIcon={open ? <UpIcon /> : <DownIcon />}
            style={{textTransform: 'none', marginLeft: '20px'}}
          >
            MapTypes
          </Button>
        </TableCell>
      </TableRow>
      {
        open && (
          map(summary.distribution.map_types, stats => (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={stats.map_type}>
              <TableCell style={{paddingLeft: '50px'}}>
                {stats.map_type}
              </TableCell>
              <TableCell align='right'>
                {toNumDisplay(stats.concepts)}
              </TableCell>
              {
                retired &&
                  <TableCell align='right'>
                    {toNumDisplay(stats.retired)}
                  </TableCell>
              }
              <TableCell align='right'>
                {toNumDisplay(stats.active)}
              </TableCell>
              <TableCell align='right'>
                {toNumDisplay(stats.total)}
              </TableCell>
            </TableRow>
          ))
        )
      }
    </React.Fragment>
  )
}


const Bar = ({first, second, firstTooltip, secondTooltip}) => {
  const _first = first || 0
  const _second = second || 0
  const _total = first + second
  const firstWidth = (_first/_total) * 100
  const secondWidth = (_second/_total) * 100
  const fullBorderRadius = '100px';
  return (
    <span className='flex-vertical-center' style={{width: 'calc(100% + 2px)', backgroundColor: 'rgba(0, 0, 0, 0.03)', height: '10px', borderRadius: fullBorderRadius}}>
      {
        firstWidth ?
          <Tooltip title={firstTooltip}>
            <span style={{width: `${max([firstWidth, 1])}%`, backgroundColor: TOMATO_RED, borderRadius: firstWidth === 100 ? fullBorderRadius : '100px 0 0 100px', height: '10px'}} />
          </Tooltip> : null
      }
      {
        Boolean(firstWidth && secondWidth) &&
          <span style={{width: '2px', backgroundColor: WHITE, height: '10px'}} />
      }
      {
        secondWidth ?
          <Tooltip title={secondTooltip}>
            <span style={{width: `${max([secondWidth, 1])}%`, backgroundColor: BLUE, borderRadius: secondWidth === 100 ? fullBorderRadius :  '0 100px 100px 0', height: '10px'}} />
          </Tooltip> : null
      }
    </span>
  )
}

const SelfSummary = ({ summary, source, isVersion }) => {
  const [distribution, setDistribution] = React.useState({})
  const [open, setOpen] = React.useState(false)
  const [anchorRef, setAnchorRef] = React.useState(null)
  const getFieldDistribution = field => {
    if(field && !distribution[field])
      APIService.new().overrideURL(source.version_url || source.url).appendToUrl('summary/').get(null, null, {verbose: true, distribution: field}).then(response => setDistribution({...distribution, [field]: get(response.data, `distribution.${field}`)}))
  }

  const toggle = (event, field) => {
    const newOpen = (!field || open === field) ? false : field
    setOpen(newOpen)
    setAnchorRef(newOpen ? {current: event.currentTarget} : null)
    getFieldDistribution(field)
  }
  const columns = isVersion ? 2 : 3;
  const width = `${100/columns}%`
  return (
    <React.Fragment>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={5} style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                Overview
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align='left' colSpan={5}>
                <span style={{padding: '20px', width: width, display: 'inline-block' }}>
                  <Bar first={summary?.concepts?.retired} second={summary?.concepts?.active} firstTooltip={`${toNumDisplay(summary?.concepts?.retired)} Retired Concepts`} secondTooltip={`${toNumDisplay(summary?.concepts?.active)} Active Concepts`} />
                  <div><b>{toNumDisplay(summary?.concepts?.active)}</b> Active out of <b>{toNumDisplay((summary?.concepts?.active || 0) + (summary?.concepts?.retired || 0))}</b> Concepts</div>
                </span>
                <span style={{padding: '20px', width: width, display: 'inline-block'}}>
                  <Bar first={summary?.mappings?.retired} second={summary?.mappings?.active} firstTooltip={`${toNumDisplay(summary?.mappings?.retired)} Retired Mappings`} secondTooltip={`${toNumDisplay(summary?.mappings?.active)} Active Mappings`} />
                  <div><b>{toNumDisplay(summary?.mappings?.active)}</b> Active out of <b>{toNumDisplay((summary?.mappings?.active || 0) + (summary?.mappings?.retired || 0))}</b> Mappings</div>
                </span>
                {
                  !isVersion &&
                    <span style={{padding: '20px', width: width, display: 'inline-block'}}>
                      <Bar first={summary?.versions?.released} second={summary?.versions?.total - summary?.versions?.released} firstTooltip={`${toNumDisplay(summary?.versions?.released)} Released Versions`} secondTooltip={`${toNumDisplay(summary?.versions?.total - summary?.versions?.released)} Remaining Versions`} />
                      <div><b>{toNumDisplay(summary?.versions?.released)}</b> Released out of <b>{toNumDisplay(summary?.versions?.total)}</b> Versions</div>
                    </span>
                }
              </TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
                <Button variant='text' onClick={event => toggle(event, 'concept_class')} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}}>
                  <p style={{margin: 0}}>
                    <b>{toNumDisplay(summary?.concepts?.concept_class)}</b>
                  </p>
                  <p style={{margin: 0}}>
                    Concept Classes
                  </p>
                </Button>
              </TableCell>
              <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
                <Button variant='text' onClick={event => toggle(event, 'datatype')} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}}>
                  <p style={{margin: 0}}>
                    <b>{toNumDisplay(summary?.concepts?.datatype)}</b>
                  </p>
                  <p style={{margin: 0}}>
                    Datatype
                  </p>
                </Button>
              </TableCell>
              <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
                <Button variant='text' onClick={event => toggle(event, 'map_type')} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}}>
                  <p style={{margin: 0}}>
                    <b>{toNumDisplay(summary?.mappings?.map_types)}</b>
                  </p>
                  <p style={{margin: 0}}>
                    MapTypes
                  </p>
                </Button>
              </TableCell>
              <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
                <Button variant='text' onClick={event => toggle(event, 'name_locale')} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}}>
                  <p style={{margin: 0}}>
                    <b>{toNumDisplay(summary?.locales?.locales)}</b>
                  </p>
                  <p style={{margin: 0}}>
                    Languages
                  </p>
                </Button>
              </TableCell>
              <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
                <Button variant='text' onClick={event => toggle(event, 'name_type')} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}}>
                  <p style={{margin: 0}}>
                    <b>{toNumDisplay(summary?.locales?.names)}</b>
                  </p>
                  <p style={{margin: 0}}>
                    Name Types
                  </p>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          {
            Boolean(open) &&
              <PopperGrow open={Boolean(open)} anchorRef={anchorRef} handleClose={toggle}>
                <div style={{maxHeight: '250px', overflow: 'auto'}}>
                  <FieldDistribution distribution={distribution[open]} field={open.replace('name_', '')} />
                </div>
              </PopperGrow>
          }
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}

const RetiredChip = ({ retired, onClick }) => (
  <Chip size='small' label='Include Retired' color={retired ? 'error' : 'default'} variant={retired ? 'contained' : 'outlined'} onClick={onClick} style={{marginLeft: '20px'}} />
)

const SourceSummary = ({ summary, source }) => {
  const isVersion = source.type === 'Source Version'
  const [openFromSources, setOpenFromSources] = React.useState(false)
  const [openToSources, setOpenToSources] = React.useState(false)
  const [retired, setRetired] = React.useState(false)
  const fromSources = isEmpty(summary?.from_sources) ? [] : summary.from_sources
  const toSources = isEmpty(summary?.to_sources) ? [] : summary.to_sources
  const colls = retired ? 5 : 4
  return (
    <div className='col-xs-12' style={{width: '90%', margin: '0 5%'}}>
      <div className='col-xs-12 no-side-padding'>
        <SelfSummary summary={summary} isVersion={isVersion} source={source} />
      </div>
      <div className='col-xs-12 no-side-padding' style={{width: '80%', margin: '0 10%', marginTop: '25px'}}>
        <div onClick={() => setOpenToSources(!openToSources)} className='col-xs-12 no-side-padding flex-vertical-center divider-highlight-hover' style={{justifyContent: 'center', cursor: 'pointer'}}>
          <Divider style={{width: '40%'}} />
          <span style={{width: '20%', textAlign: 'center'}}>
            <b>{toSources.length.toLocaleString()}</b> Mapped To Sources
          </span>
          <Divider style={{width: '40%'}} />
        </div>
        <Collapse in={Boolean(toSources.length && openToSources)} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} style={{margin: '15px 0'}}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    <span>ID</span>
                    <RetiredChip retired={retired} onClick={() => setRetired(!retired)} />
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Concepts
                  </TableCell>
                  {
                    retired &&
                      <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                        Retired
                      </TableCell>
                  }
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Active
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <React.Fragment>
                  {
                    map(toSources, source => (
                      <React.Fragment key={source.version_url}>
                        <SummaryTable summary={source} retired={retired} colls={colls} />
                        <TableRow>
                          <TableCell colSpan={colls} style={{backgroundColor: 'rgb(224, 224, 224)'}} />
                        </TableRow>
                      </React.Fragment>
                    ))
                  }
                </React.Fragment>
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </div>
      <div className='col-xs-12 no-side-padding' style={{width: '80%', margin: '0 10%', marginTop: '25px'}}>
        <div onClick={() => setOpenFromSources(!openFromSources)} className='col-xs-12 no-side-padding flex-vertical-center divider-highlight-hover' style={{justifyContent: 'center', cursor: 'pointer'}}>
          <Divider style={{width: '40%'}} />
          <span style={{width: '20%', textAlign: 'center'}}>
            <b>{fromSources.length.toLocaleString()}</b> Mapped From Sources
          </span>
          <Divider style={{width: '40%'}} />
        </div>
        <Collapse in={Boolean(fromSources.length && openFromSources)} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} style={{margin: '15px 0'}}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    <span>ID</span>
                    <RetiredChip retired={retired} onClick={() => setRetired(!retired)} />
                  </TableCell>
                  {
                    retired &&
                      <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                        Retired
                      </TableCell>
                  }
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Active
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <React.Fragment>
                  {
                    map(fromSources, source => (
                      <React.Fragment key={source.version_url}>
                        <SummaryTable summary={source} retired={retired} colls={colls} />
                        <TableRow>
                          <TableCell colSpan={colls} style={{backgroundColor: 'rgb(224, 224, 224)'}} />
                        </TableRow>
                      </React.Fragment>
                    ))
                  }
                </React.Fragment>
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </div>
    </div>
)
}

export default SourceSummary;
