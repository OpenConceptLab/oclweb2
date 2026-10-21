// Runtime config set on window by the host page. Anything that is not a string (e.g. an element
// that shares the name) is ignored so callers fall back to the next source.
export const windowConfig = name => typeof window[name] === 'string' ? window[name] : undefined
