import React from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { TableRow, TableCell } from '@material-ui/core';
import {
  keys, startCase, map, compact, uniq, get, isEmpty, isObject, isEqual, isBoolean, isString, every,
  isNumber, isArray
} from 'lodash';

const ExtrasDiff = ({lhs, rhs}) => {
  const lhsKeys = keys(lhs)
  const rhsKeys = keys(rhs)
  const iteratorKeys = uniq(compact([...lhsKeys, ...rhsKeys]))

  const formatValue = value => {
    if(isBoolean(value) || isNumber(value))
      return value.toString()
    if(isObject(value)) {
      if(isArray(value)) {
        if(isEmpty(value))
          return '--'
        if(every(value, isString))
          return value.join(', ')
        if(every(value, isNumber))
          return map(value, v => v.toString()).join(', ')
      }
      return JSON.stringify(value, undefined, 2).trim();
    }

    if(isEmpty(value))
      return value

    return value.toString().trim()
  }

  return (
    <React.Fragment>
      {
        map(iteratorKeys, (key, index) => {
          const rawLHSValue = get(lhs, key)
          const rawRHSValue = get(rhs, key)
          const lhsValue = formatValue(rawLHSValue)
          const rhsValue = formatValue(rawRHSValue)
          const hasDiff = !isEqual(rawLHSValue, rawRHSValue)
          return (
            <TableRow key={index} colSpan="12" style={{borderLeft: '10px solid lightgray'}}>
              <TableCell colSpan='2' style={{width: '10%', fontWeight: 'bold', verticalAlign: 'top'}}>
                {startCase(key)}
              </TableCell>
              {
                hasDiff ?
                <TableCell colSpan='10' style={{width: '90%'}} className='diff-row'>
                  <ReactDiffViewer
                    oldValue={lhsValue}
                    newValue={rhsValue}
                    showDiffOnly={false}
                    splitView
                    hideLineNumbers
                    compareMethod='diffLines'
                  />
                </TableCell> :
                <React.Fragment>
                  <TableCell colSpan='5' style={{width: '45%'}}>
                    {isObject(rawLHSValue) ? <pre>{lhsValue}</pre> : lhsValue}
                  </TableCell>
                  <TableCell colSpan='5' style={{width: '45%'}}>
                    {isObject(rawRHSValue) ? <pre>{rhsValue}</pre> : rhsValue}
                  </TableCell>
                </React.Fragment>
              }
            </TableRow>
          )
        })
      }
    </React.Fragment>
  );
}

export default ExtrasDiff;
