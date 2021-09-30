import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Button,
} from '@material-ui/core';
import { map, isEmpty, isBoolean, isArray, isObject, find, startCase } from 'lodash';
import CustomAttributes from './CustomAttributes'

const None = () => {
  return <div style={{padding: '20px', fontWeight: '300'}}>None</div>
}

const CustomAttributesAccordian = ({headingStyles, detailStyles, attributes}) => {
  const [raw, setRaw] = React.useState(false)
  const hasAttributes = !isEmpty(attributes)
  const onRawClick = event => {
    event.stopPropagation()
    event.preventDefault()
    setRaw(!raw)
  }
  const shouldBeNested = value => {
    return isArray(value) && Boolean(find(value, isObject))
  }
  const getNestedValueDom = (value, index) => {
    return isObject(value) ?
           <pre style={{fontSize: '12px', margin: 0}}>{JSON.stringify(value, undefined, 2)}</pre> :
           <code key={index}>{JSON.stringify(value)}</code>
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
      >
        <span className='col-md-12 no-side-padding flex-vertical-center' style={{justifyContent: 'space-between'}}>
          <span>
            <Typography style={headingStyles}>Attributes</Typography>
          </span>
          {
            hasAttributes &&
            <span>
              <Button color='primary' onClick={onRawClick }>
                { raw ? 'Formatted' : 'Raw' }
              </Button>
            </span>
          }
        </span>
      </AccordionSummary>
      <AccordionDetails style={detailStyles}>
        {
          hasAttributes ?
          (
            raw ?
            <CustomAttributes
              attributes={attributes}
              preStyles={{marginLeft: '20px'}}
            /> :
            <div className='col-md-12 no-side-padding'>
              {
                map(attributes, (value, name) => {
                  const isBool = isBoolean(value)
                  const needNesting = !isBool && shouldBeNested(value)
                  const isArr = isArray(value)
                  return (
                    <div className='col-md-12 no-side-padding flex-vertical-center custom-attributes-accordion-content' key={name}>
                      <div className='col-md-3 no-right-padding' style={{color: '#777'}}>
                        <b>{startCase(name)}</b>
                      </div>
                      <div className='col-md-9 no-left-padding' style={{maxWidth: '100%'}}>
                        {
                          isBool && value.toString()
                        }
                        {
                          needNesting &&
                          map(value, (val, index) => getNestedValueDom(val, index))
                        }
                        {
                          isArr && !needNesting &&
                          <pre style={{margin: '0'}}>{JSON.stringify(value)}</pre>
                        }
                        {
                          !isBool && !needNesting && !isArr && isObject(value) &&
                          getNestedValueDom(value)
                        }
                        {
                          !isBool && !needNesting && !isArr && !isObject(value) &&
                          value
                        }
                      </div>
                    </div>
                  )

                })
              }
            </div>
          ) :
          None()
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default CustomAttributesAccordian;
