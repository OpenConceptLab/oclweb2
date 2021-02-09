import React from 'react';
import { Link } from 'react-router-dom'
import {
  List as ListIcon,
} from '@material-ui/icons'
import { merge, get, isEmpty } from 'lodash'
import { DARKGRAY } from '../../common/constants';
import ResourceLabel from '../common/ResourceLabel';
import LastUpdatedOnLabel from '../common/LastUpdatedOnLabel';
import Summary from '../common/ConceptContainerSummaryHorizontal';

const Source = props => {
  const hasSummary = !isEmpty(props.summary);
  const mainClass = 'no-left-padding ' + hasSummary ? 'col-sm-9': 'col-sm-12';

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <div className={mainClass}>
        <Link to={props.url} style={{display: 'inline-block'}} target="_blank">
          <ResourceLabel
            owner={props.owner} id={props.id} name={props.name}
            icon={<ListIcon fontSize='small' style={{width: '10pt', color: DARKGRAY}}/>}
            colorClass="source-bg"
          />
        </Link>
        <div className='col-sm-12 no-side-padding resource-attributes'>
          <span className='resource-attr'>Source Type:</span>
          <span className='resource-value'>{props.source_type || 'None'}</span>
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

export default Source;
