import React from 'react';
import { startCase } from 'lodash';
import Tip from './Tip'

const getContent = resource => {
  return (
    <React.Fragment>
      <p className="small">
        Create a new
        <strong>{` ${startCase(resource)} Version `}</strong>
        {
          `to save the state of a ${resource}'s concepts and mappings at a specific point in time.`
        }
      </p>
	    <p className="small">
        A
        <strong> Released </strong>
        {
          ` ${resource} version indicates to your users that a particular source version is prepared for public consumption, while a`
        }
        <strong> Retired </strong>
        {`${resource} version indicates that it should no longer be used.`}
      </p>
    </React.Fragment>
  );
}

const ConceptContainerTip = ({ resource }) => {
  return (
    <Tip content={getContent(resource)} />
  );
}

export default ConceptContainerTip;
