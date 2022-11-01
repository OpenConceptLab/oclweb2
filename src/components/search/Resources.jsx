import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, Chip, CircularProgress } from '@mui/material';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon, List as ListIcon,
  Loyalty as LoyaltyIcon, AccountBalance as HomeIcon, Person as PersonIcon,
} from '@mui/icons-material'
import { map, get } from 'lodash';
import { BLUE, WHITE, DARKGRAY } from '../../common/constants';

const RESOURCES = [
  {id: 'concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' />},
  {id: 'mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' />},
  {id: 'sources', label: 'Sources', icon: <ListIcon fontSize='small' />},
  {id: 'collections', label: 'Collections', icon: <LoyaltyIcon fontSize='small' />},
  {id: 'organizations', label: 'Organizations', icon: <HomeIcon fontSize='small' />},
  {id: 'users', label: 'Users', icon: <PersonIcon fontSize='small' />},
]

const Resources = props => {
  const { active, results } = props;
  const onClick = resource => {
    if(active !== resource)
      props.onClick(resource)
  }
  return (
    <TableContainer component={Paper} className='search-resources'>
      <Table>
        <TableBody>
          {
            map(RESOURCES, resource => {
              const isActive = active === resource.id;
              const classes = isActive ? 'active' : '';
              const badgeColor = isActive ? BLUE : WHITE;
              const badgeBg = isActive ? WHITE : DARKGRAY;
              const count = get(results, `${resource.id}.total`, 0).toLocaleString()
              return (
                <TableRow key={resource.id} className={classes} hover onClick={() => onClick(resource.id)}>

                  <TableCell component="th" scope="row" className={classes}>
                    <span className='col-sm-1'>{resource.icon}</span>
                    <span className='col-sm-7'>{resource.label}</span>
                    <span className='col-sm-3 no-side-padding' style={{textAlign: 'right'}}>
                      {
                        results[resource.id].isLoadingCount ?
                        <CircularProgress style={{color: badgeBg, width: '20px', height: '20px'}} /> :
                        <Chip label={count} style={{color: badgeColor, backgroundColor: badgeBg, height: '24px'}} />
                      }
                    </span>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default Resources
