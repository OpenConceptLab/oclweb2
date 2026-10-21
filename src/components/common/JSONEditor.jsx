/* eslint-disable spellcheck/spell-checker */
import React from 'react';

// Plain-text JSON editor. onChange receives {jsObject, error}, where jsObject is the parsed value
// (undefined when the text is not valid JSON) and error is {reason} for invalid JSON, otherwise false.
const JSONEditor = ({placeholder, viewOnly, onChange, height, width}) => {
  const initialText = JSON.stringify(placeholder === undefined ? {} : placeholder, null, 2)
  const [text, setText] = React.useState(initialText)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setText(initialText)
    setError(null)
  }, [initialText])

  const onTextChange = event => {
    const value = event.target.value
    setText(value)
    try {
      const jsObject = JSON.parse(value)
      setError(null)
      if(onChange)
        onChange({jsObject, error: false})
    } catch(e) {
      setError(e.message)
      if(onChange)
        onChange({jsObject: undefined, error: {reason: e.message}})
    }
  }

  return (
    <div style={{width: width || '100%'}}>
      <textarea
        value={text}
        onChange={onTextChange}
        readOnly={Boolean(viewOnly)}
        spellCheck={false}
        rows={Math.min(Math.max(text.split('\n').length + 1, 8), 30)}
        style={{width: '100%', height: height && height !== 'auto' ? height : undefined, fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box', padding: '8px'}}
      />
      {error && <div style={{color: 'red', fontSize: '12px'}}>Invalid JSON: {error}</div>}
    </div>
  )
}

export default JSONEditor;
