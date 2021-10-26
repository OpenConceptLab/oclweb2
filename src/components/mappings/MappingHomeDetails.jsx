import React from 'react';
import moment from 'moment';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider
} from '@mui/material';
import { DATETIME_FORMAT } from '../../common/constants';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const MappingHomeDetails = ({ mapping }) => {
  return (
    <div className='col-md-12'>
      <div className='col-md-12 no-side-padding'>
        <Accordion defaultExpanded expanded>
          <AccordionSummary
            className='light-gray-bg less-paded-accordian-header'
            expandIcon={<span />}
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
            <Divider style={{width: '100%', display: 'inline-block'}} />
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
            <Divider style={{width: '100%', display: 'inline-block'}} />
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
        <CustomAttributesAccordian
          attributes={mapping.extras || {}}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
    </div>
  );
}

export default MappingHomeDetails;
