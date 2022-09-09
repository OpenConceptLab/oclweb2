import React from 'react';
import FHIRSettings from './FHIRSettings';
import ResourceIDAssignmentSettings from './ResourceIDAssignmentSettings'
import CustomAttributes from './CustomAttributes'
import AboutPage from './AboutPage'
import Others from './Others';

const AdvanceSettings = props => {
  const configs = props.advanceSettings
  return (
    <div className='col-xs-12 no-side-padding' style={{marginBottom: '40px'}}>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      {
        configs.fhirSettings &&
          <FHIRSettings {...props} />
      }
      {
        configs.assigningIds &&
          <ResourceIDAssignmentSettings {...props} />
      }
      <CustomAttributes {...props} />
      <AboutPage {...props} />
      <Others {...props} />
    </div>
  )
}

export default AdvanceSettings
