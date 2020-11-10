import React from 'react';
import { isEmpty } from 'lodash';
import NestedMappingsTable from './NestedMappingsTable';
import { getIndirectMappings, getDirectMappings } from '../../common/utils';

const AllMappingsTables = ({concept, mappings}) => {
  const getMappingsHeader = (mappings, isDirect) => {
    const count = mappings.length;
    return `${isDirect ? 'Direct' : 'Inverse'} Mappings (${count})`
  }
  const directMappings = getDirectMappings(mappings, concept);
  const indirectMappings = getIndirectMappings(mappings, concept);
  const directMappingsHeader = getMappingsHeader(directMappings, true);
  const indirectMappingsHeader = getMappingsHeader(indirectMappings);
  const zeroMappings = isEmpty(mappings);
  const getMappingsDom = (mappings, header) => {
    const isPresent = !isEmpty(mappings);
    return (
      <div className='col-sm-6' style={
        (isPresent || zeroMappings) ? {marginBottom: '10px'} : {}
      }>
        <h4 style={{background: 'lightgray', padding: "10px", marginTop: '10px', marginBottom: '0px'}}>
          { header }
        </h4>
        {
          isPresent &&
          <NestedMappingsTable mappings={mappings} />
        }
      </div>
    );
  }

  return (
    <div>
      { getMappingsDom(directMappings, directMappingsHeader) }
      { getMappingsDom(indirectMappings, indirectMappingsHeader) }
    </div>
  )
}

export default AllMappingsTables;
