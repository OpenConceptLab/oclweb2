import React from 'react';
import {
  LocalOffer as LocalOfferIcon
} from '@material-ui/icons';
import OwnerButton from '../common/OwnerButton';
import SourceButton from '../common/SourceButton';
import ConceptButton from '../common/ConceptButton';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';

const ConceptHomeHeader = ({concept}) => {
  return (
    <header className='home-header col-md-12'>
      <div className='col-md-12 container' style={{paddingTop: '10px'}}>
        <div className='no-side-padding col-md-1 home-icon'>
          <LocalOfferIcon />
        </div>
        <div className='col-md-11'>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <OwnerButton {...concept} onClick={() => {}} />
            <span className='separator'>/</span>
            <SourceButton label={concept.source} onClick={() => {}} />
            <span className='separator'>/</span>
            <ConceptButton label={concept.id} onClick={() => {}} />
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{paddingTop: '5px'}}>
            <span style={{marginRight: '10px'}}>
              {concept.display_name}
            </span>
            <span className='gray-italics-small'>
              [{concept.display_locale}]
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <span className='italic' style={{marginRight: '3px'}}>
              Class:
            </span>
            <span>
              {concept.concept_class},
            </span>
            <span className='italic' style={{marginLeft: '5px', marginRight: '3px'}}>
              Datatype:
            </span>
            <span>
              {concept.datatype}
            </span>
          </div>
          <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '2px'}}>
            <span>
              <LastUpdatedOnLabel
                date={concept.updated_on}
                by={concept.updated_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            <span style={{marginLeft: '10px'}}>
              <LastUpdatedOnLabel
                label='Created'
                date={concept.created_on}
                by={concept.created_by}
                iconSize='medium'
                noContainerClass
              />
            </span>
            {
              concept.external_id &&
              <span style={{marginLeft: '10px', marginTop: '-8px'}}>
                <ExternalIdLabel
                  externalId={concept.external_id}
                  iconSize='medium'
                />
              </span>
            }
          </div>
        </div>
      </div>
    </header>
  )
}

export default ConceptHomeHeader;
