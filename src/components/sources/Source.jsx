import React from 'react';
import {
  List as ListIcon,
} from '@material-ui/icons'
import { merge, get, isEmpty, map, isArray, reject, includes, keys } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import Summary from '../common/ConceptContainerSummaryHorizontal';

const DEFAULT_FIELDS = [{source_type: 'Source Type'}]
const LABEL_FIELDS = ['id', 'short_code', 'name', 'owner']

const Source = props => {
  const { summary, viewFields, history, currentLayoutURL, url } = props;
  const hasSummary = !isEmpty(summary);
  const mainClass = 'no-left-padding ' + hasSummary ? 'col-sm-9': 'col-sm-12';
  const customFields = isArray(viewFields) ? reject(viewFields, fieldConfig => includes(LABEL_FIELDS, keys(fieldConfig)[0])) : [];
  const fields = isEmpty(customFields) ? DEFAULT_FIELDS : customFields;
  const navigateTo = () => {
    if(currentLayoutURL)
      history.replace(currentLayoutURL)
    history.push(url)
  }

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <div className={mainClass}>
        <span onClick={navigateTo} style={{display: 'inline-block', cursor: 'pointer'}}>
          <ResourceLabel
            owner={props.owner} id={props.id} name={props.name}
            icon={<ListIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
            colorClass="source-bg"
          />
        </span>
        <div className='col-sm-12 no-side-padding resource-attributes'>
          {
            map(fields, field => {
              const attr = keys(field)[0]
              const label = field[attr];
              return (
                <React.Fragment key={attr}>
                  <span className='resource-attr'>{label}:</span>
                  <span className='resource-value'>{get(props, attr, '')}</span>
                  <br/>
                </React.Fragment>
              )
            })
          }
          {
            props.description &&
            <span className='resource-value'>{props.description}</span>
          }
        </div>
        <LastUpdatedOnLabel date={props.updated_on} />
      </div>
      {
        hasSummary &&
        <Summary {...props} />
      }
    </div>
  )
}

export default Source;
