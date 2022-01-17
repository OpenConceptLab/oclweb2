import React from 'react';
import moment from 'moment';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider
} from '@mui/material';
import { DATETIME_FORMAT } from '../../common/constants';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';
import VersionList from '../common/VersionList';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '300px', overflow: 'auto', display: 'inline-block', width: '100%', padding: '0'
}

const MappingHomeDetails = ({ mapping, singleColumn, versions, scoped }) => {
  let classes = 'col-sm-12 padding-5';
  if(!singleColumn)
    classes += ' col-md-6'
  return (
    <div className='row' style={{width: '100%', margin: 0}}>
      <div className={classes}>
        {
          !scoped &&
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
        }
        <CustomAttributesAccordian
          attributes={mapping.extras || {}}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
      <div className={classes}>
        <VersionList versions={versions} resource='mapping' />
      </div>
    </div>
  );
}

export default MappingHomeDetails;
