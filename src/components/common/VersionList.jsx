import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider, Tooltip,
  IconButton, Button, Checkbox
} from '@material-ui/core';
import { map, isEmpty, startCase, uniq, without} from 'lodash';
import {
  ExpandMore as ExpandMoreIcon, Search as SearchIcon,
  CompareArrows as CompareArrowsIcon,
} from '@material-ui/icons';
import { headFirst } from '../../common/utils';
import LastUpdatedOnLabel from './LastUpdatedOnLabel';
import Tip from './Tip';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%'
}

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const VersionList = ({ versions, resource }) => {
  const sortedVersions = headFirst(versions);

  const [selectedList, setSelectedList] = React.useState([]);
  const onSelectChange = (event, id) => {
    const newSelectedList = event.target.checked ? uniq([...selectedList, id]) : without(selectedList, id);

    setSelectedList(newSelectedList)
  }
  const isConcept = resource === 'concept';
  const canSelect = isConcept && sortedVersions.length > 1;
  const gridClass = canSelect ? 'col-md-11' : 'col-md-12'
  const showCompareOption = isConcept && selectedList.length === 2;
  const onCompareClick = event => {
    event.stopPropagation()
    event.preventDefault()

    const url = `#/concepts/compare?lhs=${selectedList[0]}&rhs=${selectedList[1]}`
    window.open(url, '_blank')
  }

  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-left-padding less-paded-accordian-header'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <span className='flex-vertical-center'>
              <Typography style={ACCORDIAN_HEADING_STYLES}>
                {`${startCase(resource)} Version History`}
              </Typography>
            </span>
            {
              showCompareOption &&
              <span className='flex-vertical-center'>
                <Button
                  startIcon={<CompareArrowsIcon fontSize='small' />}
                  variant='contained'
                  size='small'
                  color='primary'
                  style={{marginLeft: '30px'}}
                  onClick={onCompareClick}
                >
                  Compare
                </Button>
              </span>
            }
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            {
              isEmpty(sortedVersions) ?
              None() :
              map(sortedVersions, (version, index) => (
                <React.Fragment key={index}>
                  <div className='col-md-12 flex-vertical-center'>
                    {
                      canSelect &&
                      <div className='col-md-1 no-side-padding'>
                        <Checkbox size='small' onChange={event => onSelectChange(event, version.version_url)} />
                      </div>
                    }
                    <div className={`${gridClass} no-side-padding flex-vertical-center`} style={{margin: '10px 0'}}>
                      <div className='col-md-11 no-left-padding'>
                        <div className='col-md-12 no-side-padding'>
                          {
                            version.update_comment ?
                            <span>{version.update_comment}</span> :
                            <span className='gray-italics-small'>No update comment</span>
                          }
                        </div>
                        <div className='col-md-12 no-side-padding'>
                          <LastUpdatedOnLabel
                            by={version.version_created_by}
                            date={version.version_created_on}
                          />
                        </div>
                      </div>
                      <div className='col-md-1 no-right-padding'>
                        <Tooltip title='Version Link'>
                          <IconButton href={`#${version.version_url}`} color='primary' size='small'>
                            <SearchIcon fontSize='inherit' />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {
                    (index + 1) < versions.length &&
                    <Divider style={{width: '100%'}} />
                  }
                </React.Fragment>
              ))
            }
          </AccordionDetails>
        </Accordion>
      </div>
      <div className='col-md-4 no-right-padding'>
        <Tip
          content={
            <p className="small">
              {`All changes to a ${resource} are automatically saved to its `}
					    <strong>{`${startCase(resource)} Version History`}</strong>.
            </p>
          }
        />
      </div>
    </div>
  );
}

export default VersionList;
