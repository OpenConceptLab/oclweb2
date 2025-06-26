import React from 'react';
import { isEmpty, includes, isString, map, keys, flatten, uniq, isBoolean } from 'lodash';
import { formatDate, formatWebsiteLink } from '../../common/utils';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

const getURLComponent = val => formatWebsiteLink(val);
const getBoolComponent = val => val ? 'True' : 'False';
const getDateComponent = val => formatDate(val);
const getJSONComponent = val => {
  if(isString(val)) {
    try {
      val = JSON.parse(val)
    } catch {
      //do nothing
    }
  }
  return <pre style={{margin: '0px'}}>{JSON.stringify(val, undefined, 1)}</pre>;
}

const HeaderAttribute = ({label, value, gridClass, type, color}) => {
  const valueType = type || 'text';
  const className = 'no-side-padding flex-vertical-start ' + (gridClass ? gridClass : 'col-md-4')
  const getValueComponent = () => {
    if(valueType === 'text')
      return value;
    if (valueType === 'json')
      return getJSONComponent(value)
    if (valueType === 'url')
      return getURLComponent(value)
    if (valueType === 'boolean')
      return getBoolComponent(value)
    if (valueType === 'date')
      return getDateComponent(value)
    if(valueType === 'table') {
        if(value?.length > 0) {
          let columns = uniq(flatten(value.map(val => keys(val))))
          return <Table size='small' sx={{margin: '4px 0', '.MuiTableCell-root': {padding: '6px', border: '1px solid rgba(0, 0, 0, 0.1)'}}}>
                   <TableHead>
                     <TableRow>
                       {
                         columns.map(
                           col => <TableCell key={col} sx={{fontSize: '12px'}}><b>{col}</b></TableCell>
                         )
                       }
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {
                       map(value, (val, index) => (
                         <TableRow key={index}>
                           {
                             columns.map(col => (
                               <TableCell key={col}>
                                 <span style={{display: 'inline-block', maxWidth: '350px', wordBreak: 'break-all'}}>
                                   {isBoolean(val[col]) ? val[col].toString() : val[col] || null}
                                 </span>
                               </TableCell>
                             ))
                           }
                         </TableRow>
                       ))
                     }
                   </TableBody>
                   </Table>
        } else {
          return value
        }
    }

    return value;
  }
  const isValid = () => {
    if(type === 'boolean')
      return !includes([null, undefined], value)
    return !isEmpty(value) && !includes(['none', 'None'], value);
  }

  return (
    <React.Fragment>
      {
        isValid() &&
        <div className={className} style={color ? {color: color} : {}}>
          <span className='italic' style={{marginRight: '10px', color: color? color : 'rgba(0, 0, 0, 0.6)'}}>
            {label}:
          </span>
          <span>
            {getValueComponent()}
          </span>
        </div>
      }
    </React.Fragment>
  )
}

export default HeaderAttribute;
