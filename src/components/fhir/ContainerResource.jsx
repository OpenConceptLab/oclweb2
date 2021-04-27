import React from 'react';
import { merge, get, map, isArray } from 'lodash';
import HeaderAttribute from '../common/HeaderAttribute';
import Contact from './Contact';

const ContainerResource = props => {
  const contact = isArray(props.resource.contact) ?
                  (
                    <span>
                      {
                        map(
                          props.resource.contact,
                          (contact, index) => <Contact key={index} {...contact} />
                        )
                      }
                    </span>
                  ) :
                  props.resource.contact;

  return (
    <div className='col-sm-12' style={merge({paddingTop: '10px', paddingLeft: 0, paddingRight: 0}, get(props, 'style', {}))}>
      <HeaderAttribute value={props.resource.name} label='Name' gridClass="col-md-12" />
      <HeaderAttribute value={props.resource.description} label='Description' gridClass="col-md-12" />
      <HeaderAttribute value={props.resource.purpose} label='Purpose' gridClass="col-md-12" />
      <HeaderAttribute value={props.resource.useContext} label='Use Context' gridClass="col-md-12" />
      <HeaderAttribute value={props.resource.jurisdiction} label='Jurisdiction' gridClass="col-md-12" type='json' />
      <HeaderAttribute label='Contact' value={contact} gridClass='col-md-12' />
      <HeaderAttribute label='Hierarchy Meaning' value={props.resource.hierarchyMeaning} gridClass='col-md-12' />
    </div>
  )
}

export default ContainerResource;
