import React from 'react';

const useToggle = (initialState = false) => {
    const [value, setValue] = React.useState(initialState);
    const toggle = React.useCallback(() => setValue(state => !state), []);
    const setTrue = React.useCallback(() => setValue(true), []);
    const setFalse = React.useCallback(() => setValue(false), []);
    
    return {value, toggle, setTrue, setFalse}
}

export default useToggle