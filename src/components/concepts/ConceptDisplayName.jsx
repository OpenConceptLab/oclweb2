import React from 'react';


const ConceptDisplayName = ({ concept, style }) => {
  return (
    <span style={style || {}}>
      <span className={concept.retired ? 'retired': ''}>
        {concept.display_name}
      </span>
      {
        concept.display_locale &&
        <span className='gray-italics-small' style={{marginLeft: '5px'}}>
          [{concept.display_locale}]
        </span>
      }
    </span>
  )
}

export default ConceptDisplayName;
