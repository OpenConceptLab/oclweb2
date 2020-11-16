import React from 'react';
import moment from 'moment';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider
} from '@material-ui/core';
import { DATETIME_FORMAT } from '../../common/constants';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const MappingHomeDetails = ({ mapping }) => {
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
                {mapping.retired ? 'True' : 'False'}
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
                <FromConceptLabel {...mapping} />
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                To Concept
              </div>
              <div className='col-md-8 no-right-padding'>
                <ToConceptLabel {...mapping} />
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
                {moment(mapping.updated_at).format(DATETIME_FORMAT)}
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
                {moment(mapping.created_at).format(DATETIME_FORMAT)}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
}

export default MappingHomeDetails;
