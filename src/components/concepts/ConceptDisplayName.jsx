import React from 'react';

const renderHighlightedText = text => {
  let highlighting = false
  const nodes = []
  text.split(/(<em>|<\/em>)/).forEach(part => {
    if(part === '<em>') {
      highlighting = true
    } else if(part === '</em>') {
      highlighting = false
    } else if(part) {
      nodes.push(
        highlighting ?
          <b className='searchable' key={nodes.length}>{part}</b> :
          <React.Fragment key={nodes.length}>{part}</React.Fragment>
      )
    }
  })
  return nodes
}

const ConceptDisplayName = ({ concept, style }) => {
  const highlights = concept?.search_meta?.search_highlight
  const synonymHighlight = highlights?.synonyms
  const nameHighlight = highlights?.name
  const synonymPrefix = (!nameHighlight?.length && synonymHighlight?.length) ? synonymHighlight[0] : ''
  return (
    <span style={style || {}}>
      <span className={concept.retired ? 'retired': ''}>
        {
          synonymPrefix &&
            <span>
              <span>{renderHighlightedText(synonymPrefix)}</span>
              <span style={{margin: '0 5px'}}>&rarr;</span>
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
