import React from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, Tooltip
} from '@mui/material';
import {
  InfoOutlined as InfoIcon
} from '@mui/icons-material'
import { get, isEmpty, forEach, map, groupBy, without, keys, compact, has } from 'lodash';
import TabCountLabel from '../common/TabCountLabel';
import LocalizedTextRow from './LocalizedTextRow';

const ACCORDIAN_HEADING_STYLES = {
  fontWeight: 'bold',
}
const ACCORDIAN_DETAILS_STYLES = {
  width: '100%', padding: '0', overflowX: 'auto'
}

const None = () => {
  return <div style={{padding: '5px 15px', fontWeight: '300'}}>None</div>
}

const groupLocales = (locales, source) => {
  const groupedBySource = {defaultLocales: {}, supportedLocales: {}, rest: {}}
  const grouped = groupBy(locales, 'locale')
  const supportedLocales = get(source, 'supported_locales') || []

  if(get(source, 'default_locale') && grouped[source.default_locale])
    groupedBySource.defaultLocales[source.default_locale] = grouped[source.default_locale]

  forEach(supportedLocales, locale => {
    if(locale !== source.default_locale && has(grouped, locale))
      groupedBySource.supportedLocales[locale] = grouped[locale]
  })

  forEach(
    without(keys(grouped), ...compact([get(source, 'default_locale'), ...supportedLocales])),
    locale => {
      if(has(grouped, locale))
        groupedBySource.rest[locale] = grouped[locale]
    }
  )

  return groupedBySource
}


const HomeLocales = ({ concept, label, locales, source, tooltip, isDescription, searchable }) => {
  const count = locales.length;
  const groupedLocales = groupLocales(locales, source)

  return (
    <Accordion expanded style={{borderRadius: 'unset'}}>
      <AccordionSummary
        className='light-gray-bg less-paded-accordion-header'
        expandIcon={<span />}
        aria-controls="panel1a-content"
        style={{cursor: 'inherit'}}
      >
        <span className='flex-vertical-center' style={{width: '100%', justifyContent: 'space-between'}}>
          <TabCountLabel label={label} count={count} style={ACCORDIAN_HEADING_STYLES} />
          {
            tooltip &&
            <span className='flex-vertical-center' style={{marginLeft: '10px'}}>
              <Tooltip title={tooltip}>
                <InfoIcon fontSize='small' color='action' />
              </Tooltip>
            </span>
          }
        </span>
      </AccordionSummary>
      <AccordionDetails style={ACCORDIAN_DETAILS_STYLES}>
        {
          isEmpty(locales) ?
          None() :
          <Table size="small" aria-label="concept-home-mappings" className='nested-mappings'>
            <TableBody>
              {
                map(groupedLocales.defaultLocales, (localizedTexts, locale) => (
                  <LocalizedTextRow
                    concept={concept}
                    key={locale}
                    locale={locale}
                    localizedTexts={localizedTexts}
                    isDescription={isDescription}
                    searchable={searchable}
                  />
                ))
              }
              {
                map(groupedLocales.supportedLocales, (localizedTexts, locale) => (
                  <LocalizedTextRow
                    concept={concept}
                    key={locale}
                    locale={locale}
                    localizedTexts={localizedTexts}
                    isDescription={isDescription}
                    searchable={searchable}
                  />
                ))
              }
              {
                map(groupedLocales.rest, (localizedTexts, locale) => (
                  <LocalizedTextRow
                    concept={concept}
                    key={locale}
                    locale={locale}
                    localizedTexts={localizedTexts}
                    isDescription={isDescription}
                    searchable={searchable}
                  />
                ))
              }
            </TableBody>
          </Table>
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default HomeLocales;
