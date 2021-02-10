import React from 'react';
import { Link } from 'react-router-dom'
import { Loyalty as LoyaltyIcon } from '@material-ui/icons'
import { merge, get, isEmpty, map, isObject } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import Summary from '../common/ConceptContainerSummaryHorizontal';

const DEFAULT_FIELDS = {collection_type: 'Collection Type'}

const Collection = props => {
  const { summary, viewFields } = props;
  const hasSummary = !isEmpty(summary);
  const mainClass = 'no-left-padding ' + hasSummary ? 'col-sm-9': 'col-sm-12';
  const fields = (isEmpty(viewFields) || !isObject(viewFields)) ? DEFAULT_FIELDS : viewFields;

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <div className={mainClass}>
        <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
          <ResourceLabel
            owner={props.owner} id={props.id} name={props.name}
            icon={<LoyaltyIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
            colorClass="collection-bg"
          />
        </Link>
        <div className='col-sm-12 no-side-padding resource-attributes'>
          {
            map(fields, (label, attr) => (
              <React.Fragment key={attr}>
                <span className='resource-attr'>{label}:</span>
                <span className='resource-value'>{get(props, attr, 'None')}</span>
                <br/>
              </React.Fragment>
            ))
          }
          {
            props.description &&
            <React.Fragment>
              <br/>
              <span className='resource-value'>{props.description}</span>
            </React.Fragment>
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

export default Collection;
