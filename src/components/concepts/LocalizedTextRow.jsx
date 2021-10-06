import React from 'react';
import {
  TableRow, TableCell, Tooltip, Chip, IconButton
} from '@material-ui/core';
import {
  Flag as FlagIcon, FileCopy as CopyIcon
} from '@material-ui/icons'
import { get, map, orderBy } from 'lodash';
import ExternalIdLabel from '../common/ExternalIdLabel';
import { toFullAPIURL, copyURL } from '../../common/utils';

const LocalizedTextRow = ({concept, locale, localizedTexts, isDescription}) => {
  const typeAttr = isDescription ? 'description_type' : 'name_type'
  const nameAttr = isDescription ? 'description' : 'name'
  const urlAttr = isDescription ? 'descriptions' : 'names'
  const onCopyClick = localizedTextId => copyURL(toFullAPIURL(concept.url + urlAttr + '/' + localizedTextId + '/'))
  const count = get(localizedTexts, 'length') || 0

  return (
    <React.Fragment key={locale}>
      <TableRow hover>
        <TableCell align='left' rowSpan={count + 1} style={{paddingRight: '5px', verticalAlign: 'top', paddingLeft: '15px', width: '50px', paddingTop: '5px'}}>
          <div className='gray-italics-small flex-vertical-center'>
            {`[${locale}]`}
          </div>
        </TableCell>
      </TableRow>
      {
        map(orderBy(localizedTexts, [text => get(text, nameAttr, '').toLowerCase()], ['asc']), localizedText => {
          const type = get(localizedText, typeAttr)
          return (
            <TableRow
              hover
              key={localizedText.uuid}>
              <TableCell
                align='left'
                className='ellipsis-text'
                style={{maxWidth: '200px'}}>
                <div className='col-md-12 no-side-padding'>
                  <div className='col-md-12 no-side-padding flex-vertical-center'>
                    <span style={{marginRight: '10px', whiteSpace: 'pre-wrap'}}>{ get(localizedText, nameAttr) }</span>
                    {
                      type &&
                      <span style={{marginRight: '5px'}}>
                        <Chip style={{height: '20px', fontSize: '10px'}} size='small' variant='default' label={type} />
                      </span>
                    }
                    {
                      localizedText.locale_preferred &&
                      <span style={{marginRight: '5px'}}>
                        <Tooltip arrow title={`Preferred ${nameAttr} for this locale`} placement='top-start'>
                          <FlagIcon color='secondary' fontSize='inherit' style={{width: '18px', marginTop: '4px'}}/>
                        </Tooltip>
                      </span>
                    }
                  </div>
                  {
                    localizedText.external_id &&
                    <div className='col-md-12 no-side-padding'>
                      <ExternalIdLabel externalId={localizedText.external_id} iconSize='small' />
                    </div>
                  }
                </div>
              </TableCell>
              <TableCell align='right' style={{width: '24px', paddingRight: '5px'}}>
                <Tooltip arrow title='Copy Link' placement='right'>
                  <IconButton onClick={() => onCopyClick(localizedText.uuid)} color='primary' size='small'>
                    <CopyIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          )
        })
      }
    </React.Fragment>
  )
}

export default LocalizedTextRow;
