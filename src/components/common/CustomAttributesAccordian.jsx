import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { map, isEmpty, isBoolean, isArray, isObject, find } from 'lodash';

const None = () => {
  return <div style={{margin: '5px', fontWeight: '300'}}>None</div>
}

const CustomAttributesAccordian = ({
  headingStyles, detailStyles, attributes
}) => {

  const shouldBeNested = value => {
    return isArray(value) && Boolean(find(value, isObject))
  }

  const getNestedValueDom = value => {
    return isObject(value) ?
           <details>
             <summary>{`${JSON.stringify(value).slice(0, 50)}...`}</summary>
             <p>
               <pre style={{fontSize: '12px'}}>{JSON.stringify(value, undefined, 2)}</pre>
             </p>
           </details> :
           <code>{JSON.stringify(value)}</code>
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg'
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
      >
        <Typography style={headingStyles}>Custom Attributes</Typography>
      </AccordionSummary>
      <AccordionDetails style={detailStyles}>
        {
          isEmpty(attributes) ?
          None() :
          map(attributes, (value, name) => {
            const isBool = isBoolean(value)
            const needNesting = !isBool && shouldBeNested(value)
            const isArr = isArray(value)
            return (
              <div className='col-md-12' style={{marginBottom: '5px'}} key={name}>
                <div style={{fontWeight: '300'}} className='col-md-3 no-left-padding'>
                  {name}
                </div>
                <div className='col-md-9 no-right-padding ellipsis-text' style={{maxWidth: '100%'}}>
                  {
                    isBool && value.toString()
                  }
                  {
                    needNesting &&
                    map(value, val => getNestedValueDom(val))
                  }
                  {
                    isArr && !needNesting &&
                    <pre style={{margin: '0'}}>{JSON.stringify(value)}</pre>
                  }
                  {
                    !isBool && !needNesting && !isArr &&
                    value
                  }
                </div>
              </div>
            )
          })
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default CustomAttributesAccordian;
