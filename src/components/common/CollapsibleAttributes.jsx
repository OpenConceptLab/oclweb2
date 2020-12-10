import React from 'react';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon
} from '@material-ui/icons';
import { Collapse, Chip } from '@material-ui/core';
import { map, get, startCase, isArray } from 'lodash';
import HeaderAttribute from './HeaderAttribute';

const CollapsibleAttributes = ({
  object, urlAttrs, jsonAttrs, textAttrs, dateAttrs, booleanAttrs
}) => {
  const [expand, setExpand] = React.useState(false);
  const onExpand = () => setExpand(!expand);

  return (
    <React.Fragment>
      <Collapse in={expand} className="col-md-8" style={{padding: '0px', display: `${expand ? 'block' : 'none'}`}}>
        {
          isArray(urlAttrs) && map(urlAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-10' type='url' />
          ))
        }
        {
          isArray(textAttrs) && map(textAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-10' />
          ))
        }
        {
          isArray(booleanAttrs) && map(booleanAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-10' type='boolean' />
          ))
        }
        {
          isArray(dateAttrs) && map(dateAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-10' type='date' />
          ))
        }
        {
          isArray(jsonAttrs) && map(jsonAttrs, attr => (
            <HeaderAttribute key={attr} label={`${startCase(attr)}`} value={get(object, attr)} gridClass='col-md-10' type='json' />
          ))
        }
      </Collapse>
      <div className='col-md-12 no-side-padding' style={{marginLeft: '-8px', marginTop: '2px'}}>
        <Chip
          label={expand ? "Less" : "More"}
          onClick={onExpand}
          color="primary"
          variant="outlined"
          size="small"
          deleteIcon={expand ? <ArrowUpIcon fontSize="inherit" /> : <ArrowDownIcon fontSize="inherit" /> }
          onDelete={onExpand}
          style={{border: 'none'}}
        />
      </div>
    </React.Fragment>
  )
}

export default CollapsibleAttributes;
