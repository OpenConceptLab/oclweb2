import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider
} from '@material-ui/core';
import {
  LocalOffer as LocalOfferIcon,
} from '@material-ui/icons';
import { DARKGRAY, DATETIME_FORMAT } from '../../common/constants';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ResourceLabel from '../common/ResourceLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const MappingHomeDetails = ({ mapping }) => {
  const fromConceptLabel = <ResourceLabel
                             owner={mapping.from_source_owner}
                             parent={mapping.from_source_name}
                             id={mapping.from_concept_code}
                             name={mapping.from_concept_name}
                             icon={
                               <LocalOfferIcon
                                 fontSize='small' style={{width: '10pt', color: DARKGRAY}}
                               />
                             }
  />;
  const toConceptLabel = <ResourceLabel
                           owner={mapping.to_source_owner}
                           parent={mapping.to_source_name}
                           id={mapping.to_concept_code}
                           name={mapping.to_concept_name}
                           icon={
                             <LocalOfferIcon
                               fontSize='small' style={{width: '10pt', color: DARKGRAY}}
                             />
                           }
  />;

  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-side-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Mapping Details</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                ID
              </div>
              <div className='col-md-8 no-right-padding'>
                {mapping.uuid}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Retired
              </div>
              <div className='col-md-8 no-right-padding'>
                {mapping.retired}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Map Type
              </div>
              <div className='col-md-8 no-right-padding'>
                {mapping.map_type}
              </div>
            </div>
            <Divider style={{width: '100%'}} />
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                From Concept
              </div>
              <div className='col-md-8 no-right-padding'>
                {
                  mapping.from_concept_url ?
                  <Link to={mapping.from_concept_url}>
                    {fromConceptLabel}
                  </Link> :
                  <span>
                    {fromConceptLabel}
                  </span>
                }
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                To Concept
              </div>
              <div className='col-md-8 no-right-padding'>
                {
                  mapping.to_concept_url ?
                  <Link to={mapping.to_concept_url}>
                    {toConceptLabel}
                  </Link> :
                  <span>
                    {toConceptLabel}
                  </span>
                }
              </div>
            </div>
            <Divider style={{width: '100%'}} />
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Updated By
              </div>
              <div className='col-md-8 no-right-padding'>
                {mapping.updated_by}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Updated On
              </div>
              <div className='col-md-8 no-right-padding'>
                {moment(mapping.updated_on).format(DATETIME_FORMAT)}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Created By
              </div>
              <div className='col-md-8 no-right-padding'>
                {mapping.created_by}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Created On
              </div>
              <div className='col-md-8 no-right-padding'>
                {moment(mapping.created_on).format(DATETIME_FORMAT)}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default MappingHomeDetails;
