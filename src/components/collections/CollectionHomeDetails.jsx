import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Divider
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { get } from 'lodash';
import CustomAttributesAccordian from '../common/CustomAttributesAccordian';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  display: 'inline-block', width: '100%', textAlign: 'left',
}

const CollectionHomeDetails = ({ collection }) => {
  return (
    <div className='col-md-12'>
      <div className='col-md-8 no-side-padding'>
        <Accordion defaultExpanded>
          <AccordionSummary
            className='light-gray-bg'
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
          >
            <Typography style={ACCORDIAN_HEADING_STYLES}>Collection Details</Typography>
          </AccordionSummary>
          <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Short Code
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.short_code}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Name
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.name}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Full Name
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.full_name}
              </div>
            </div>

            <Divider style={{width: '100%'}} />
            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Description
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.description}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Collection Type
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.collection_type}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Website
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.website}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Public Access
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.public_access}
              </div>
            </div>

            <Divider style={{width: '100%'}} />

            <div className='col-md-12' style={{marginBottom: '5px', marginTop: '15px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Default Locale
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.default_locale}
              </div>
            </div>
            <div className='col-md-12' style={{marginBottom: '5px'}}>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Supported Locales
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.supported_locales.join(', ')}
              </div>
            </div>
            <div className='col-md-12'>
              <div style={{fontWeight: '300'}} className='col-md-4 no-left-padding'>
                Custom Validation Schema
              </div>
              <div className='col-md-8 no-right-padding'>
                {collection.custom_validation_schema || 'None'}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
        <CustomAttributesAccordian
          attributes={get(collection, 'extras', {})}
          headingStyles={ACCORDIAN_HEADING_STYLES}
          detailStyles={ACCORDIAN_DETAILS_STYLES}
        />
      </div>
    </div>
  );
}

export default CollectionHomeDetails;
