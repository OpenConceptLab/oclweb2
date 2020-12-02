import React from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { map, isEmpty } from 'lodash';
import OwnerLabel from '../common/OwnerLabel';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  maxHeight: '525px', overflow: 'scroll', display: 'inline-block', width: '100%', textAlign: 'left',
}

const UserHomeOrgs = ({ isLoadingOrgs, orgs }) => {
  return (
    <div className='col-md-12'>
      <Accordion defaultExpanded>
        <AccordionSummary
          className='light-gray-bg less-paded-accordian-header'
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography style={ACCORDIAN_HEADING_STYLES}>Organization Membership</Typography>
        </AccordionSummary>
        <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
          {
            isLoadingOrgs ?
            <CircularProgress color='primary' />:
            <div>
              {
                isEmpty(orgs) ?
                <span>No User Organizations</span> :
                map(orgs, org => (
                  <Link to={org.url} key={org.id}>
                    <OwnerLabel resource='org' {...org} />
                  </Link>
                ))
              }
            </div>
          }
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default UserHomeOrgs;
