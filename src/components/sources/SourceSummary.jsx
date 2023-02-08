import React from 'react';
import { Table, TableHead, TableCell, TableBody, TableRow, TableContainer, Paper, Tooltip, Collapse, Button, Divider } from '@mui/material'
import DownIcon from '@mui/icons-material/KeyboardArrowDown';
import UpIcon from '@mui/icons-material/KeyboardArrowUp';
import { map, max, isEmpty } from 'lodash';
import { TOMATO_RED, BLUE, WHITE, LIGHT_GRAY } from '../../common/constants';
import { toNumDisplay } from '../../common/utils';

const SummaryTable = ({ summary }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <React.Fragment>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <a href={summary.version_url} target='_blank' rel='noreferrer noopener'>
            {summary.short_code}
          </a>
        </TableCell>
        <TableCell>
          {summary.id}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.concepts)}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.retired)}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.active)}
        </TableCell>
        <TableCell align='right'>
          {toNumDisplay(summary.distribution.total)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} align='left' style={{cursor: 'pointer', padding: 0}} onClick={() => setOpen(!open)}>
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
              <TableCell colSpan={2} style={{paddingLeft: '50px'}}>
                {stats.map_type}
              </TableCell>
              <TableCell align='right'>
                {toNumDisplay(stats.concepts)}
              </TableCell>
              <TableCell align='right'>
                {toNumDisplay(stats.retired)}
              </TableCell>
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

const SelfSummary = ({ summary, isVersion }) => {
  const columns = isVersion ? 2 : 3;
  const width = `${100/columns}%`
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow colSpan={3}>
            <TableCell colSpan={3} style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
              Overview
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell align='left' colSpan={3}>
              <span style={{padding: '20px', width: width, display: 'inline-block' }}>
              <Bar first={summary.retired_concepts} second={summary.active_concepts} firstTooltip={`${toNumDisplay(summary.retired_concepts)} Retired Concepts`} secondTooltip={`${toNumDisplay(summary.active_concepts)} Active Concepts`} />
                <div><b>{toNumDisplay(summary.active_concepts)}</b> Active out of <b>{toNumDisplay((summary.active_concepts || 0) + (summary.retired_concepts || 0))}</b> Concepts</div>
                </span>
              <span style={{padding: '20px', width: width, display: 'inline-block'}}>
              <Bar first={summary.retired_mappings} second={summary.active_mappings} firstTooltip={`${toNumDisplay(summary.retired_mappings)} Retired Mappings`} secondTooltip={`${toNumDisplay(summary.active_mappings)} Active Mappings`} />
              <div><b>{toNumDisplay(summary.active_mappings)}</b> Active out of <b>{toNumDisplay((summary.active_mappings || 0) + (summary.retired_mappings || 0))}</b> Mappings</div>
            </span>
            {
              !isVersion &&
                <span style={{padding: '20px', width: width, display: 'inline-block'}}>
                  <Bar first={summary.released_versions} second={summary.versions - summary.released_versions} firstTooltip={`${toNumDisplay(summary.released_versions)} Released Versions`} secondTooltip={`${toNumDisplay(summary.versions - summary.released_versions)} Remaining Versions`} />
                  <div><b>{toNumDisplay(summary.released_versions)}</b> Released out of <b>{toNumDisplay(summary.versions)}</b> Versions</div>
                </span>
            }
              </TableCell>
          </TableRow>
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '33.3%'}}>
              <p style={{margin: 0}}>
                <b>{toNumDisplay(summary.concept_class)}</b>
              </p>
              <p style={{margin: 0}}>
                Concept Classes
              </p>
            </TableCell>
            <TableCell align='center' style={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: '33.3%'}}>
              <p style={{margin: 0}}>
                <b>{toNumDisplay(summary.datatype)}</b>
              </p>
              <p style={{margin: 0}}>
                Datatype
              </p>
            </TableCell>
            <TableCell align='center'>
              <p style={{margin: 0}}>
                <b>{toNumDisplay(summary.map_types)}</b>
              </p>
              <p style={{margin: 0}}>
                MapTypes
              </p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const SourceSummary = ({ summary, source }) => {
  const isVersion = source.type === 'Source Version'
  const [openFromSources, setOpenFromSources] = React.useState(false)
  const [openToSources, setOpenToSources] = React.useState(false)
  const fromSources = isEmpty(summary?.from_sources) ? [] : summary.from_sources
  const toSources = isEmpty(summary?.to_sources) ? [] : summary.to_sources
  return (
    <div className='col-xs-12' style={{width: '90%', margin: '0 5%'}}>
      <div className='col-xs-12 no-side-padding'>
        <SelfSummary summary={summary} isVersion={isVersion} />
      </div>
      <div className='col-xs-12 no-side-padding' style={{width: '80%', margin: '0 10%', marginTop: '25px'}}>
        <div onClick={() => setOpenToSources(!openToSources)} className='col-xs-12 no-side-padding flex-vertical-center divider-highlight-hover' style={{justifyContent: 'center', cursor: 'pointer'}}>
          <Divider style={{width: '40%', backgroundColor: LIGHT_GRAY}} />
          <span style={{width: '20%', textAlign: 'center'}}>
            <b>{toSources.length.toLocaleString()}</b> Mapped To Sources
          </span>
          <Divider style={{width: '40%', backgroundColor: LIGHT_GRAY}} />
        </div>
        <Collapse in={toSources.length && openToSources} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} style={{margin: '15px 0'}}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    ID
                  </TableCell>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Version
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Concepts
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Retired
                  </TableCell>
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
                        <SummaryTable summary={source} />
                        <TableRow>
                          <TableCell colSpan={6} style={{backgroundColor: 'rgb(224, 224, 224)'}} />
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
          <Divider style={{width: '40%', backgroundColor: LIGHT_GRAY}} />
          <span style={{width: '20%', textAlign: 'center'}}>
            <b>{fromSources.length.toLocaleString()}</b> Mapped From Sources
          </span>
          <Divider style={{width: '40%', backgroundColor: LIGHT_GRAY}} />
        </div>
        <Collapse in={fromSources.length && openFromSources} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} style={{margin: '15px 0'}}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    ID
                  </TableCell>
                  <TableCell style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Version
                  </TableCell>
                  <TableCell align='right' style={{backgroundColor: 'rgb(224, 224, 224)', fontWeight: 'bold'}}>
                    Retired
                  </TableCell>
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
                        <SummaryTable summary={source} />
                        <TableRow>
                          <TableCell colSpan={6} style={{backgroundColor: 'rgb(224, 224, 224)'}} />
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
