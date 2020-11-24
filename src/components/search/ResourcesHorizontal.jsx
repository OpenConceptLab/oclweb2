import React from 'react';
import { CircularProgress, Card, CardHeader, Avatar } from '@material-ui/core';
import {
  LocalOffer as LocalOfferIcon, Link as LinkIcon, List as ListIcon,
  Loyalty as LoyaltyIcon, Home as HomeIcon, Person as PersonIcon,
} from '@material-ui/icons'
import { map, get } from 'lodash';
import { BLUE, WHITE, GREEN, ORANGE } from '../../common/constants';

const RESOURCES = [
  {id: 'concepts', label: 'Concepts', icon: <LocalOfferIcon fontSize='small' style={{color: BLUE}} />, bgColor: BLUE},
  {id: 'mappings', label: 'Mappings', icon: <LinkIcon fontSize='small' style={{color: BLUE}} />, bgColor: BLUE},
  {id: 'sources', label: 'Sources', icon: <ListIcon fontSize='small' style={{color: GREEN}} />, bgColor: GREEN},
  {id: 'collections', label: 'Collections', icon: <LoyaltyIcon fontSize='small' style={{color: GREEN}} />, bgColor: GREEN},
  {id: 'organizations', label: 'Organizations', icon: <HomeIcon fontSize='small' style={{color: ORANGE}} />, bgColor: ORANGE},
  {id: 'users', label: 'Users', icon: <PersonIcon fontSize='small' style={{color: ORANGE}}/>, bgColor: ORANGE},
]

const ResourcesHorizontal = props => {
  const { active, results } = props;
  const onClick = resource => {
    if(active !== resource)
      props.onClick(resource)
  }

  return (
    <span className='col-sm-12 no-side-padding' style={{marginBottom: '5px'}}>
      {
        map(RESOURCES, (resource, i) => {
          const isActive = active === resource.id;
          const count = <span style={isActive ? {color: WHITE} : {}}>
            {get(results, `${resource.id}.total`, 0).toLocaleString()}
          </span>;
          const isLoading = results[resource.id].isLoadingCount
          const resourceColor = resource.bgColor;
          const inProgress = <CircularProgress
                               style={{width: '14px', height: '14px', color: isActive ? WHITE : resourceColor}}
          />;
          let containerClasses = 'col-sm-2 ';
          if(i === 0)
            containerClasses += 'no-left-padding';
          if(i === RESOURCES.length - 1)
            containerClasses += 'no-right-padding';

          return (
            <div className={containerClasses} style={{padding: '0 5px'}} key={i}>
              <Card className='col-sm-12 no-side-padding clickable' key={i} style={isActive ? {backgroundColor: resource.bgColor, color: WHITE} : {}} onClick={() => onClick(resource.id)}>
                <CardHeader
                  avatar={
                    <Avatar aria-label="resource" style={isActive ? {backgroundColor: WHITE} : {border: `1px solid ${resourceColor}`, background: WHITE}}>
                      {resource.icon}
                    </Avatar>
                  }
                  title={resource.label}
                  subheader={isLoading ? inProgress : count}
                />
              </Card>
            </div>
          )
        })
      }
    </span>
  )
}

export default ResourcesHorizontal;
