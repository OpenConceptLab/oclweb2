import React from 'react';

const ConceptDisplayName = ({ concept, style }) => {
  let synonymPrefix = ''
  const highlights = concept?.meta?.search_highlight
  const synonymHighlight = highlights?.synonyms
  const nameHighlight = highlights?.name
  if(!nameHighlight?.length && synonymHighlight?.length)
    synonymPrefix = synonymHighlight[0].replace('<em>', "<b className='searchable'>").replace('</em>', '</b>')
  return (
    <span style={style || {}}>
      <span className={concept.retired ? 'retired': ''}>
        {
          synonymPrefix &&
            <span>
              <span dangerouslySetInnerHTML={{__html: synonymPrefix}} />
              <span> ==> </span>
              </span>
        }
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
