import React from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Divider, CircularProgress
} from '@material-ui/core';
import { ExpandMore as ExpandIcon, LocalOffer as LocalOfferIcon } from '@material-ui/icons';
import { get, map, compact, groupBy, startCase, has, filter, isEmpty, uniqWith, isEqual } from 'lodash';
import { DARKGRAY } from '../../common/constants';
import { formatWebsiteLink } from '../../common/utils';
import ResourceLabel from '../common/ResourceLabel';

const ConceptMapGroups = ({ resource, groups, isHAPI, isLoading }) => {
  const [open, setOpen] = React.useState(null);
  const getParentLabel = uri => {
    const parts = compact(uri.split('/'))
    return `${parts[1]} / ${parts[3]}`
  }
  const getHeaderAttrs = () => {
    if(isHAPI)
      return [
        {type: 'url', attr: 'source', label: 'Source'},
        {type: 'url', attr: 'target', label: 'Target'},
      ]
    return [
      {type: 'parentLabel', attr: 'source', label: 'Source'},
      {type: 'parentLabel', attr: 'target', label: 'Target'},
    ]
  }

  const getCodeLabel = (code, display) => {
    const id = display ? code : null
    const name = display ? display : code
    return (
      <div className='col-md-12' style={{margin: '5px 0'}} key={code}>
        <ResourceLabel noSeparator id={id} name={name} icon={
          <LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}} />
        } />
      </div>
    )
  };

  const getValue = (value, type) => {
    if(!type)
      return value
    if(type === 'url')
      return formatWebsiteLink(value)
    if(type === 'url' && !value.startsWith('http'))
      return getParentLabel(value)
    if(type === 'parentLabel')
      return getParentLabel(value)

    return value
  }

  const getSummaryTemplate = (key, label, value, type, divider) => {
    return (
      <React.Fragment key={key}>
        <span>
          <span className='gray-italics'> {label}: </span>
          <span> { getValue(value, type) } </span>
        </span>
        { divider && <Divider orientation='vertical' style={{margin: '0 10px'}} /> }
      </React.Fragment>
    )
  }

  const getTargets = target => {
    if(has(target, '0.extension.0.valueString'))
      return groupBy(target, 'extension.0.valueString')

    if(has(target, '0.equivalence'))
      return groupBy(target, 'equivalence')
  };

  const uniqElements = elements => uniqWith(elements, isEqual)
  const getSource = () => get(resource, 'sourceCanonical') || get(resource, 'sourceUri')
  const getTarget = () => get(resource, 'targetCanonical') || get(resource, 'targetUri')
  const getGroupHeaderValue = (group, attr) => {
    const value = get(group, attr)
    if(value)
      return value
    if(attr === 'source')
      return getSource()
    if(attr === 'target')
      return getTarget()
  }
  return (
    <React.Fragment>
      {
        isLoading ?
        <div className='col-md-12' style={{textAlign: 'center', marginBottom: '15px'}}>
          <CircularProgress />
        </div> :
        (
          isEmpty(groups) ?
          <Accordion>
            <AccordionSummary>
              <div className='col-md-12 flex-vertical-center'>
                {
                  getSummaryTemplate(0, 'Source', getSource(), isHAPI ? 'url' : 'parentLabel', true)
                }
                {
                  getSummaryTemplate(1, 'Target', getTarget(), isHAPI ? 'url' : 'parentLabel', true)
                }
                { getSummaryTemplate(null, 'Count', 0, false, false) }
              </div>
            </AccordionSummary>
          </Accordion> :
          map(groups, (group, index) => {
            const elements = uniqElements(get(group, 'element', []))
            const count = elements.length
            const isOpen = Boolean(count && (open === index))
            const headerAttrs = getHeaderAttrs()
            return (
              <Accordion key={index} expanded={isOpen} onChange={() => setOpen(isOpen ? null : index)}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <div className='col-md-12 flex-vertical-center'>
                    {
                      map(
                        headerAttrs,
                        (meta, i) => getSummaryTemplate(i, meta.label, getGroupHeaderValue(group, meta.attr), meta.type, true)
                      )
                    }
                    { getSummaryTemplate(null, 'Count', count, false, false) }
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <div className='col-md-12'>
                    {
                      map(uniqElements(group.element), ({code, display, target}) => {
                        return (
                          <React.Fragment key={code}>
                            <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginBottom: '5px'}}>
                              <div className='col-md-4 no-left-padding' style={{textAlign: 'center'}}>
                                {getCodeLabel(code, display)}
                              </div>
                              <div className='col-md-8 no-side-padding'>
                                {
                                  map(getTargets(target), (codes, mapType) => {
                                    const validCodes = filter(codes, code => has(code, 'code'))
                                    return (
                                      <Accordion key={mapType} className='col-md-12 no-side-padding'>
                                        <AccordionSummary expandIcon={<ExpandIcon />}>
                                          <span className='flex-vertical-center'>
                                            <strong>{startCase(mapType)}</strong>
                                            <span className='gray-italics-small' style={{marginLeft: '5px'}}>
                                              {`(${validCodes.length})`}
                                            </span>
                                          </span>
                                        </AccordionSummary>
                                        <AccordionDetails className='col-md-12 no-side-padding' style={{display: 'inline-block'}}>
                                          {
                                            map(validCodes, (targetCode, _i) => (
                                              <React.Fragment key={targetCode.code}>
                                                {
                                                  _i !== 0 &&
                                                  <Divider style={{margin: '5px 0', width: '100%', display: 'inline-block'}}  />
                                                }
                                                <div className='col-md-12'>
                                                  {getCodeLabel(targetCode.code, targetCode.display)}
                                                </div>
                                              </React.Fragment>
                                            ))
                                          }
                                        </AccordionDetails>
                                      </Accordion>
                                    )
                                  })
                                }
                              </div>
                            </div>
                            <Divider style={{margin: '5px 0', width: '100%', display: 'inline-block'}} />
                          </React.Fragment>
                        )
                      })
                    }
                  </div>
                </AccordionDetails>
              </Accordion>
            )
          })
        )
      }
    </React.Fragment>
  )
}

export default ConceptMapGroups;
