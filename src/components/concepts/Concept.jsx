import React from 'react';
import { Link } from 'react-router-dom'
import { LocalOffer as LocalOfferIcon } from '@material-ui/icons'
import { merge, get, isArray, reject, keys, isEmpty, includes, map } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';

const DEFAULT_FIELDS = [{concept_class: 'Class'}, {datatype: 'Datatype'}]
const LABEL_FIELDS = ['id', 'display_name', 'name', 'owner', 'source']

const Concept = props => {
  const { viewFields } = props;
  const customFields = isArray(viewFields) ? reject(viewFields, fieldConfig => includes(LABEL_FIELDS, keys(fieldConfig)[0])) : [];
  const fields = isEmpty(customFields) ? DEFAULT_FIELDS : customFields;

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
        <ResourceLabel
          owner={props.owner} parent={props.source} id={props.display_name} name={props.id}
          icon={<LocalOfferIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
        />
      </Link>
      <div className='col-sm-12 no-side-padding resource-attributes'>
        {
          map(fields, field => {
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
      <LastUpdatedOnLabel date={props.version_created_on} />
    </div>
  )
}

export default Concept;
