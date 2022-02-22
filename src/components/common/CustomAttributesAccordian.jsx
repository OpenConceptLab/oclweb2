import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails, Switch, Grid, Typography
} from '@mui/material';
import {
  map, isEmpty, isBoolean, isArray, isObject, find, startCase, keys, orderBy, isNumber
} from 'lodash';
import { BLUE } from '../../common/constants';
import CustomAttributes from './CustomAttributes'
import TabCountLabel from './TabCountLabel'

const None = () => {
  return <div style={{padding: '5px 15px', fontWeight: '300'}}>None</div>
}

const CustomAttributesAccordian = ({headingStyles, detailStyles, attributes}) => {
  const [raw, setRaw] = React.useState(false)
  const hasAttributes = !isEmpty(attributes)
  const onRawClick = event => {
    event.stopPropagation()
    event.preventDefault()
    setRaw(!raw)
    return false;
  }
  const shouldBeNested = value => {
    return isArray(value) && Boolean(find(value, isObject))
  }
  const getNestedValueDom = (value, index) => {
    return isObject(value) ?
           <pre style={{fontSize: '12px', margin: 0}}>{JSON.stringify(value, undefined, 2)}</pre> :
           <code key={index}>{JSON.stringify(value)}</code>
  }

  const getAttributeKeys = () => {
    if(!hasAttributes)
      return []
    return orderBy(keys(attributes), attr => attr.toLowerCase())
  }

  const count = keys(attributes).length

  return (
    <Accordion expanded style={{borderRadius: 'unset'}}>
      <AccordionSummary
        className='light-gray-bg less-paded-accordian-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
        style={{cursor: 'inherit'}}
      >
        <span className='col-xs-12 no-side-padding flex-vertical-center' style={{justifyContent: 'space-between'}}>
          <TabCountLabel label='Attributes' style={headingStyles} count={count}/>
          {
            hasAttributes &&
            <span onClick={onRawClick}>
              <Typography component="div">
                <Grid component="label" container alignItems="center" spacing={1}>
                  <Grid item>
                    <span style={{fontSize: '14px', color: raw ? 'gray' : BLUE}}>Formatted</span>
                  </Grid>
                  <Grid item>
                    <Switch size='small' checked={raw} onChange={onRawClick} name="raw" color='primary' />
                  </Grid>
                  <Grid item>
                    <span style={{fontSize: '14px', color: raw ? BLUE : 'gray'}}>Raw</span>
                  </Grid>
                </Grid>
              </Typography>
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
            <div className='col-xs-12 no-side-padding'>
              {
                map(getAttributeKeys(), name => {
                  const value = attributes[name]
                  const isBool = isBoolean(value)
                  const needNesting = !isBool && shouldBeNested(value)
                  const isArr = isArray(value)
                  return (
                    <div className='col-xs-12 no-side-padding custom-attributes-accordion-content' key={name}>
                      <div className='col-xs-3 no-right-padding' style={{color: '#777'}}>
                        <b>{startCase(name)}</b>
                      </div>
                      <div className='col-xs-9 no-left-padding flex-vertical-center' style={{maxWidth: '100%'}}>
                        {
                          isBool && value.toString()
                        }
                        {
                          needNesting &&
                          <div>
                            {
                              map(value, (val, index) => getNestedValueDom(val, index))
                            }
                          </div>
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
