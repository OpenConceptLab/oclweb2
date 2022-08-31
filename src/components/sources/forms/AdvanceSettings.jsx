import React from 'react';
import FHIRSettings from './FHIRSettings';
import ResourceIDAssignmentSettings from './ResourceIDAssignmentSettings'
import CustomAttributes from './CustomAttributes'
import AboutPage from './AboutPage'

const AdvanceSettings = props => {
  const configs = props.advanceSettings
  return (
    <div className='col-xs-12 no-side-padding'>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      <FHIRSettings {...props} />
      <ResourceIDAssignmentSettings {...props} />
      <CustomAttributes {...props} />
      <AboutPage {...props} />
    </div>
  )
}

export default AdvanceSettings
