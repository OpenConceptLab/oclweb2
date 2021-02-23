import React from 'react';
import { Link } from 'react-router-dom';
import {
  Link as LinkIcon,
} from '@material-ui/icons'
import { merge, get, isArray, map, isEmpty, keys } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import ExternalIdLabel from '../common/ExternalIdLabel';
import ThisConceptLabel from '../common/ThisConceptLabel';
import FromConceptLabel from './FromConceptLabel';
import ToConceptLabel from './ToConceptLabel';

const LABEL_STYLES = {
  textAlign: 'center', marginTop: '4px', fontSize: '12px', color: DARKGRAY
};

const Mapping = props => {
  const { viewFields } = props;
  const customFields = isArray(viewFields) ? viewFields : [];

  const isFromConceptInContext = props.conceptContext === props.from_concept_code;
  const isToConceptInContext = !isFromConceptInContext && (props.conceptContext === props.to_concept_code);
  const fromConceptLabel = isFromConceptInContext ?
                           <ThisConceptLabel /> :
                           <FromConceptLabel {...props} />;
  const toConceptLabel = isToConceptInContext ?
                         <ThisConceptLabel /> :
                         <ToConceptLabel {...props} />;

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
        <ResourceLabel
          owner={props.owner} parent={props.source} id={props.id} name={props.map_type}
          icon={<LinkIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
        />
      </Link>
      <div className='col-sm-12 no-left-padding' style={{margin: '5px'}}>
        <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
          From:
        </div>
        <div className='col-sm-11 no-side-padding'>
          {fromConceptLabel}
        </div>
      </div>
      <div className='col-sm-12 no-left-padding' style={{margin: '0px 5px 5px 5px'}}>
        <div className='col-sm-1 no-side-padding' style={LABEL_STYLES}>
          To:
        </div>
        <div className='col-sm-11 no-side-padding'>
          {toConceptLabel}
        </div>
      </div>
      {
        !isEmpty(customFields) &&
        <div className='col-sm-12 no-side-padding resource-attributes'>
          {
            map(customFields, field => {
              const attr = keys(field)[0]
              const label = field[attr];
              return (
                <React.Fragment key={attr}>
                  <span className='resource-attr'>{label}:</span>
                  <span className='resource-value'>{get(props, attr, 'None')}</span>
                  <br/>
                </React.Fragment>
              )
            })
          }
        </div>
      }
      <div className='col-md-12 no-side-padding flex-vertical-center' style={{marginTop: '5px'}}>
        {
          props.external_id &&
          <span style={{marginRight: '10px', marginTop: '-8px'}}>
            <ExternalIdLabel externalId={props.external_id} />
          </span>
        }
        <span>
          <LastUpdatedOnLabel date={props.version_created_on} noContainerClass={Boolean(props.external_id)} />
        </span>
      </div>
    </div>
  )
}

export default Mapping;
