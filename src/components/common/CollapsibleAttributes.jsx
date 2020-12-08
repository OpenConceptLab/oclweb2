import React from 'react';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon
} from '@material-ui/icons';
import { Collapse, Chip } from '@material-ui/core';
import { map, get, startCase, isEmpty, isArray } from 'lodash';
import { formatDate } from '../../common/utils';
import HeaderAttribute from './HeaderAttribute';


const CollapsibleAttributes = ({
  object, urlAttrs, jsonAttrs, textAttrs, dateAttrs, booleanAttrs
}) => {
  const [expand, setExpand] = React.useState(false);
  const onExpand = () => setExpand(!expand);

  const getURLComponent = attr => {
    const val = get(object, attr)
    if(val)
      return <a href={val} target="_blank" rel="noopener noreferrer">{val}</a>;
  }

  const getJSONComponent = attr => {
    const val = get(object, attr)
    if(!isEmpty(val))
      return <pre>{JSON.stringify(val, undefined, 2)}</pre>;
  }

  return (
    <React.Fragment>
      <div className='col-md-12 no-side-padding' style={{marginLeft: '-8px'}}>
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
      <Collapse in={expand} className="col-md-8" style={{fontSize: '95%', padding: '5px 0', display: `${expand ? 'block' : 'none'}`}}>
        {
          isArray(urlAttrs) && map(urlAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={getURLComponent(attr)} gridClass='col-md-6' />
          ))
        }
        {
          isArray(textAttrs) && map(textAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-6' />
          ))
        }
        {
          isArray(booleanAttrs) && map(booleanAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr) ? 'True' : 'False'} gridClass='col-md-6' />
          ))
        }
        {
          isArray(dateAttrs) && map(dateAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr) ? formatDate(object[attr]) : 'None'} gridClass='col-md-6' />
          ))
        }
        {
          isArray(jsonAttrs) && map(jsonAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={getJSONComponent(attr)} gridClass='col-md-6' />
          ))
        }
      </Collapse>
    </React.Fragment>
  )
}

export default CollapsibleAttributes;
