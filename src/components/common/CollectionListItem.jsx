import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Typography, Tooltip } from '@mui/material';
import {
  LocalOffer as ConceptIcon, Loyalty as CollectionIcon,
  Person as UserIcon, AccountBalance as OrgIcon,
} from '@mui/icons-material';
import { isNumber, merge } from 'lodash'
import { GREEN } from '../../common/constants';

const SubText = ({ text, divider }) => (
  <span className='flex-vertical-center'>
    <Typography
      sx={{ display: 'inline', color: 'rgba(0, 0, 0, 0.6)' }}
      component="span"
      className='flex-vertical-center'>
      <span className='flex-vertical-center'>
        {
          divider &&
            <span className='flex-vertical-center' style={{backgroundColor: 'rgba(0, 0, 0, 0.6)', width: '3px', height: '3px', borderRadius: '100px', margin: '0 8px'}} />
        }
        <span className='flex-vertical-center' style={{fontSize: '14px'}}>
          {text}
        </span>
      </span>
    </Typography>
  </span>
)


const Owner = ({ option, marginTop }) => (
  <Tooltip title={option.owner}>
    <span style={{display: 'flex', marginTop: marginTop || 0, alignItems: 'center'}}>
      {
        option.owner_type === 'User' ?
          <UserIcon style={{marginRight: '4px', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px' }}/> :
        <OrgIcon style={{marginRight: '4px', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px'}} />
      }
      <span className='flex-vertical-center' style={{maxWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'rgba(0, 0, 0, 0.26)', fontSize: '13px'}}>
        {option.owner}
      </span>
    </span>
  </Tooltip>
)

const CollectionListItem = ({ option, style, listItemProps }) => {
  return (
    <ListItem
      {...listItemProps}
      alignItems="flex-start"
      style={merge({alignItems: 'flex-start'}, (style || {}))}
      secondaryAction={
        <Owner option={option} marginTop='-22px' />
      }>
      <ListItemIcon style={{minWidth: 'auto', marginRight: '10px'}}>
        <CollectionIcon style={{color: GREEN, marginTop: '-5px'}} fontSize='large' />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            sx={{ maxWidth: 'calc(100% - 90px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {option.name}
          </Typography>
        }
        secondary={
          (
            isNumber(option?.summary?.active_concepts) ?
              <span className='flex-vertical-center'>
                <Typography
                  sx={{ display: 'inline', color: 'rgba(0, 0, 0, 0.6)', fontSize: '14px' }}
                  component="span"
                  className='flex-vertical-center'>
                  <ConceptIcon size='small' style={{marginRight: '4px', width: '13.3px', height: '13.3px'}} />
                  {option.summary.active_concepts.toLocaleString()}
                </Typography>
                { option.suggestionType && <SubText text={option.suggestionType} divider /> }
              </span> :
            (
              option.suggestionType ? <SubText text={option.suggestionType} /> : ''
            )
          )
        }
      />
    </ListItem>

  )
}

export default CollectionListItem;
