import React from 'react';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon
} from '@material-ui/icons';
import { Collapse, Chip } from '@material-ui/core';
import { map, get, startCase, isEmpty, isArray } from 'lodash';
import { formatDate } from '../../common/utils';


const CollapsibleAttributes = ({
  object, urlAttrs, jsonAttrs, textAttrs, dateAttrs, booleanAttrs
}) => {
  const [expand, setExpand] = React.useState(false);
  const onExpand = () => setExpand(!expand);

  return (
    <React.Fragment>
      <div className='col-md-12 no-side-padding' style={{marginLeft: '-8px', marginTop: '5px'}}>
        <Chip
          label="More"
          onClick={onExpand}
          color="primary"
          variant="outlined"
          size="small"
          deleteIcon={expand ? <ArrowUpIcon fontSize="inherit" /> : <ArrowDownIcon fontSize="inherit" /> }
          onDelete={onExpand}
          style={{border: 'none'}}
        />
      </div>
      <Collapse in={expand} className="col-md-8" style={{fontSize: '95%', padding: '5px', display: `${expand ? 'block' : 'none'}`}}>
        {
          isArray(urlAttrs) && map(urlAttrs, attr => (
            <div className='col-md-6 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '10px'}}>
                {`${startCase(attr)}:`}
              </span>
              <span>
                {
                  get(object, attr) ?
                  <a href={object[attr]} target="_blank" rel="noopener noreferrer">
                    {object[attr]}
                  </a> :
                  'None'
                }
              </span>
            </div>
          ))
        }
        {
          isArray(textAttrs) && map(textAttrs, attr => (
            <div className='col-md-6 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '10px'}}>
                {`${startCase(attr)}:`}
              </span>
              <span> {get(object, attr) || 'None'} </span>
            </div>
          ))
        }
        {
          isArray(booleanAttrs) && map(booleanAttrs, attr => (
            <div className='col-md-6 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '10px'}}>
                {`${startCase(attr)}:`}
              </span>
              <span> {get(object, attr) ? 'True' : 'False'} </span>
            </div>
          ))
        }
        {
          isArray(dateAttrs) && map(dateAttrs, attr => (
            <div className='col-md-6 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '10px'}}>
                {`${startCase(attr)}:`}
              </span>
              <span>
                {get(object, attr) ? formatDate(object[attr]) : 'None'}
              </span>
            </div>
          ))
        }
        {
          isArray(jsonAttrs) && map(jsonAttrs, attr => (
            <div className='col-md-6 no-side-padding flex-vertical-center'>
              <span className='italic' style={{marginRight: '10px'}}>
                {`${startCase(attr)}:`}
              </span>
              <span>
                {
                  isEmpty(get(object, attr)) ?
                  'None':
                  <pre>{JSON.stringify(object[attr], undefined, 2)}</pre>
                }
              </span>
            </div>
          ))
        }
      </Collapse>
    </React.Fragment>
  )
}

export default CollapsibleAttributes;
