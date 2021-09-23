import React from 'react';
import {
  ArrowDropDown as ArrowDownIcon, ArrowDropUp as ArrowUpIcon
} from '@material-ui/icons';
import { Collapse, Chip } from '@material-ui/core';
import { map, get } from 'lodash';
import HeaderAttribute from './HeaderAttribute';
import SupportedLocales from '../common/SupportedLocales';

const CollapsibleAttributes = ({
  object, hiddenAttributes
}) => {
  const [expand, setExpand] = React.useState(false);
  const onExpand = () => setExpand(!expand);

  return (
    <React.Fragment>
      <Collapse in={expand} className="col-md-8" style={{padding: '0px', display: `${expand ? 'block' : 'none'}`}}>
        {
          map(hiddenAttributes, (attr) => {
            const value = get(object, attr.value)
            if (!value) return null
            
            if (attr.value === "supported_locales" || attr.value === "default_locale"){
              return <HeaderAttribute key={attr.label} label="Supported Locales" value={<SupportedLocales {...object} />} gridClass="col-md-12" type="component" />
            }
            return <HeaderAttribute key={attr.label} label={attr.label} value={value} gridClass='col-md-10' type={attr.type} />
          })
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
