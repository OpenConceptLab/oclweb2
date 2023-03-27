import React from 'react';
import { Table, TableHead, TableCell, TableBody, TableRow, TableContainer, Paper, Tooltip, Button, List, ListItem, Skeleton, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material'
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { map, max, isNull, camelCase, isNumber, isArray, startCase, get } from 'lodash';
import APIService from '../../services/APIService';
import { TOMATO_RED, BLUE, WHITE } from '../../common/constants';
import { toNumDisplay } from '../../common/utils';
import PopperGrow from '../common/PopperGrow';


const FieldDistribution = ({distribution, field, source, humanize}) => {
  let baseURL = source.version_url || source.url
  baseURL += field.includes('map_type') ? 'mappings/' : 'concepts/'
  const isNameType = field === 'type'
  let _field = isNameType ? 'nameTypes' : camelCase(field)

  return (
    <List dense>
      {
        map(distribution, state => {
          let value = state[0]
          //let value = isNameType ? (state[field] ? state[field] : 'None') : (state[field] || '').toLowerCase()
          let url = baseURL + `?facets={"${_field}":{"${value}":true}}`
          return (
            <ListItem key={value} secondaryAction={toNumDisplay(state[1])}>
              <a href={"#" + url}>{isNull(value) ? <i>None</i> : (humanize ? startCase(value) : value)}</a>
            </ListItem>
          )
        })
      }
    </List>
  )
}


const SummaryTable = ({ summary, source, fromSource }) => {
  const [expand, setExpand] = React.useState(false)
  const [distribution, setDistribution] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(false)
  const baseURL = (source.version_url || source.url || '') + 'mappings/'
  const targetSource = fromSource ? "fromConceptSource" : "toConceptSource"
  const onExpandToggle = sourceName => {
    const newExpand = !expand
    setExpand(!expand)
    if(newExpand && !distribution && !isFetching) {
      setIsFetching(true)
      APIService
        .new()
        .overrideURL(source.version_url || source.url)
        .appendToUrl('summary/')
        .get(null, null, {verbose: true, distribution: fromSource ? 'from_sources_map_type' : 'to_sources_map_type', sources: sourceName})
        .then(response => {
          setDistribution(get(response.data?.distribution?.to_sources_map_type, '0.distribution'))
          setIsFetching(false)
        })
    }
  }
  const tdStyles = distribution ? {} : {background: 'rgba(224, 224, 224, 0.5)', borderBottom: 'none'}
  return (
    <React.Fragment>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          {summary[0]}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary[1])}
        </TableCell>
        <TableCell style={{width: '10px', padding: 0, background: distribution ? WHITE : 'rgba(224, 224, 224)', cursor: distribution ? 'inherit' : 'pointer'}}>
        </TableCell>
        <TableCell align='right' style={tdStyles}>
          {toNumDisplay(distribution?.active)}
        </TableCell>
        <TableCell align='right' style={tdStyles}>
          {toNumDisplay(distribution?.retired)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={2} align='left' style={{cursor: 'pointer', padding: 0, background: distribution ? WHITE : 'rgba(224, 224, 224)'}} onClick={() => onExpandToggle(summary[0])}>
          <Button
            aria-label="expand row"
            size="small"
            onClick={() => onExpandToggle(summary[0])}
            startIcon={expand ? <UpIcon /> : <DownIcon />}
            style={{textTransform: 'none', marginLeft: '20px'}}
          >
            MapTypes
          </Button>
        </TableCell>
        <TableCell style={{width: '10px', padding: 0, background: distribution ? WHITE: 'rgba(224, 224, 224)', cursor: distribution ? 'inherit': 'pointer'}}>
          {
            distribution ?
              null :
              <IconButton variant='contained' color='primary' size='small' onClick={() => onExpandToggle(summary[0])}>
                <ArrowRightIcon fontSize='inherit' style={{transform: expand ? 'rotate(225deg)' : 'rotate(45deg)'}} />
              </IconButton>
          }
        </TableCell>
        <TableCell colSpan={2} align='left' style={{padding: 0, background: distribution ? WHITE : 'rgba(224, 224, 224, 0.5)'}} onClick={() => onExpandToggle(summary[0])}>
        </TableCell>
      </TableRow>
      {
        expand && (
          isFetching ?
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell style={{paddingLeft: '50px'}}>
                <Skeleton />
              </TableCell>
              <TableCell align='right'>
                <Skeleton />
              </TableCell>
              <TableCell align='right'>
              </TableCell>
              <TableCell align='right'>
                <Skeleton />
              </TableCell>
              <TableCell align='right'>
                <Skeleton />
              </TableCell>
            </TableRow> :
          map(distribution?.map_types, stats => {
            let url = baseURL + `?facets={"mapType":{"${stats.map_type.toLowerCase()}":true},"${targetSource}":{"${summary[0]}":true}}`
            return (
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={stats.map_type}>
                <TableCell style={{paddingLeft: '50px'}}>
                  <a href={"#" + url}>{stats.map_type}</a>
                </TableCell>
                <TableCell align='right'>
                  {toNumDisplay(stats.total)}
                </TableCell>
                <TableCell align='right'>
                </TableCell>
                <TableCell align='right'>
                  {toNumDisplay(stats.active)}
                </TableCell>
                <TableCell align='right'>
                  {toNumDisplay(stats.retired)}
                </TableCell>
              </TableRow>
            )
          })
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
  return isNumber(second) ? (
    <span className='flex-vertical-center' style={{width: 'calc(100% + 2px)', backgroundColor: 'rgba(0, 0, 0, 0.03)', height: '10px', borderRadius: fullBorderRadius}}>
      {
        firstWidth ?
          <Tooltip title={firstTooltip}>
            <span style={{width: `${max([firstWidth, 1])}%`, backgroundColor: BLUE, borderRadius: firstWidth === 100 ? fullBorderRadius : '100px 0 0 100px', height: '10px'}} />
          </Tooltip> : null
      }
      {
        Boolean(firstWidth && secondWidth) &&
          <span style={{width: '2px', backgroundColor: WHITE, height: '10px'}} />
      }
      {
        secondWidth ?
          <Tooltip title={secondTooltip}>
            <span style={{width: `${max([secondWidth, 1])}%`, backgroundColor: TOMATO_RED, borderRadius: secondWidth === 100 ? fullBorderRadius :  '0 100px 100px 0', height: '10px'}} />
          </Tooltip> : null
      }
    </span>
  ) : <Skeleton />
}


const SelfSummaryCell = ({label, value, onClick}) => (
  <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '20%', padding: 0}}>
    <Button variant='text' onClick={onClick} style={{textTransform: 'none', display: 'inline', width: '100%', height: '100%'}} disabled={value === 0}>
      <p style={{margin: 0, display: 'flex', alignItem: 'center', justifyContent: 'center'}}>
        {
          isArray(value) ? <b>{toNumDisplay(value.length)}</b> : <Skeleton width={20} height={20} variant="circular" />
        }
      </p>
      <p style={{margin: 0}}>
        {isArray(value) ? label : <Skeleton /> }
      </p>
    </Button>
  </TableCell>
)

const SelfSummary = ({ summary, source, isVersion }) => {
  const [distribution, setDistribution] = React.useState({})
  const [open, setOpen] = React.useState(false)
  const [anchorRef, setAnchorRef] = React.useState(null)
  const toggle = (event, field, value) => {
    const newOpen = (!field || open === field) ? false : field
    setOpen(newOpen)
    setAnchorRef(newOpen ? {current: event.currentTarget} : null)
    setDistribution({...distribution, [field]: value})
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
                  <Bar first={summary?.concepts?.active} second={summary?.concepts?.retired} firstTooltip={`${toNumDisplay(summary?.concepts?.active)} Active Concepts`} secondTooltip={`${toNumDisplay(summary?.concepts?.retired)} Retired Concepts`} />
                  {
                    summary?.concepts ?
                      <div><b>{toNumDisplay(summary?.concepts?.active)}</b> Active out of <b>{toNumDisplay((summary?.concepts?.active || 0) + (summary?.concepts?.retired || 0))}</b> Concepts</div> :
                      <Skeleton />
                  }
                </span>
                <span style={{padding: '20px', width: width, display: 'inline-block'}}>
                  <Bar first={summary?.mappings?.active} second={summary?.mappings?.retired} firstTooltip={`${toNumDisplay(summary?.mappings?.active)} Active Mappings`} secondTooltip={`${toNumDisplay(summary?.mappings?.retired)} Retired Mappings`} />
                  {
                    summary?.mappings ?
                      <div><b>{toNumDisplay(summary?.mappings?.active)}</b> Active out of <b>{toNumDisplay((summary?.mappings?.active || 0) + (summary?.mappings?.retired || 0))}</b> Mappings</div> :
                      <Skeleton />
                  }
                </span>
                {
                  !isVersion &&
                    <span style={{padding: '20px', width: width, display: 'inline-block'}}>
                      <Bar first={summary?.versions?.total - summary?.versions?.released} second={summary?.versions?.released} firstTooltip={`${toNumDisplay(summary?.versions?.total - summary?.versions?.released)} Remaining Versions`} secondTooltip={`${toNumDisplay(summary?.versions?.released)} Released Versions`} />
                      {
                        summary?.versions ?
                          <div><b>{toNumDisplay(summary?.versions?.released)}</b> Released out of <b>{toNumDisplay(summary?.versions?.total)}</b> Versions</div> :
                          <Skeleton />
                      }
                    </span>
                }
              </TableCell>
            </TableRow>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <SelfSummaryCell value={summary?.concepts?.concept_class} label='Concept Classes' onClick={event => toggle(event, 'concept_class', summary?.concepts?.concept_class)} />
              <SelfSummaryCell value={summary?.concepts?.datatype} label='Datatype' onClick={event => toggle(event, 'datatype', summary?.concepts?.datatype)} />
              <SelfSummaryCell value={summary?.mappings?.map_type} label='MapTypes' onClick={event => toggle(event, 'map_type', summary?.mappings?.map_type)} />
              <SelfSummaryCell value={summary?.concepts?.locale} label='Languages' onClick={event => toggle(event, 'locale', summary?.concepts?.locale)} />
              <SelfSummaryCell value={summary?.concepts?.name_type} label='Name Types' onClick={event => toggle(event, 'name_type', summary?.concepts?.name_type)} />
            </TableRow>
          </TableBody>
          {
            Boolean(open) &&
              <PopperGrow open={Boolean(open)} anchorRef={anchorRef} handleClose={toggle}>
                <div style={{maxHeight: '250px', overflow: 'auto'}}>
                  <FieldDistribution distribution={distribution[open]} field={open.replace('name_', '')} source={source} humanize={!['name_type', 'locale'].includes(open)}/>
                </div>
              </PopperGrow>
          }
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}


const MappedSourceSummary = ({mappedSource, fromSource, columns, source}) => {
  return (
    <React.Fragment key={mappedSource.version_url}>
      <SummaryTable summary={mappedSource} source={source} fromSource={fromSource} />
      <TableRow>
        <TableCell colSpan={columns} style={{backgroundColor: 'rgb(224, 224, 224)'}} />
      </TableRow>
    </React.Fragment>
  )
}

const MappedSources = ({title, label, source, summary, columns, fromSource, sources}) => {
  const count = sources?.length

  return (
    <div className='col-xs-12 no-side-padding' style={{width: '80%', margin: '0 10%', marginTop: '15px'}}>
      <Accordion disabled={count === 0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {
            summary?.id ?
              <React.Fragment>
                <b style={{marginRight: '5px'}}>{sources.length.toLocaleString()}</b> {title}
              </React.Fragment> :
            <span className='flex-vertical-center' style={{width: '100%'}}>
              <Skeleton width={25} height={25} variant="circular" style={{marginRight: '10px'}}/><Skeleton style={{width: '50%'}} height={30} />
            </span>
          }
        </AccordionSummary>
        <AccordionDetails>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                  <span>{label}</span>
                </TableCell>
                <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                  Total
                </TableCell>
                <TableCell align='center' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold', width: '10px'}}>
                </TableCell>
                <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                  Active
                </TableCell>
                <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                  Retired
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <React.Fragment>
                {
                  map(sources, (mappedSource, index) => (
                    <MappedSourceSummary
                      key={index}
                      mappedSource={mappedSource}
                      source={source}
                      fromSource={fromSource}
                      columns={columns}
                    />
                  ))
                }
              </React.Fragment>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

const SourceSummary = ({ summary, source }) => {
  const isVersion = source.type === 'Source Version'
  const columns = 5
  return (
    <div className='col-xs-12' style={{width: '90%', margin: '0 5%'}}>
      <div className='col-xs-12 no-side-padding'>
        <SelfSummary summary={summary} isVersion={isVersion} source={source} />
      </div>
      <MappedSources
        title='Mapped To Sources'
        label='Target Source'
        source={source}
        columns={columns}
        summary={summary}
        sources={summary?.mappings?.to_concept_source}
      />
      <MappedSources
        title='Mapped From Sources'
        label='From Source'
        source={source}
        columns={columns}
        fromSource
        summary={summary}
        sources={summary?.mappings?.from_concept_source}
      />
    </div>
  )
}

export default SourceSummary;
