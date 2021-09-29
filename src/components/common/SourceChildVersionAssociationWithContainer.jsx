import React from 'react';
import { map, isEmpty, compact, values } from 'lodash';
import { Collapse } from '@material-ui/core';
import ConceptContainerLabel from './ConceptContainerLabel';
import CollapsibleDivider from './CollapsibleDivider';

const SourceChildVersionAssociationWithContainer = ({ associatedWith, resource }) => {
  const [open, setOpen] = React.useState(false)
  const toggleOpen = () => setOpen(!open)
  const getResourceDetails = uri => {
    const parts = compact(uri.split('/'))
    return {
      ownerType: parts[0],
      owner: parts[1],
      id: parts[3],
      version: parts[4],
      uri: uri
    }
  }

  const isPresent = associatedWith && (!isEmpty(associatedWith.source) || !isEmpty(associatedWith.collection))
  const count = values(associatedWith.source).length + values(associatedWith.collection).length

  return (
    <React.Fragment>
      {
        isPresent &&
        <div className='col-md-12 no-side-padding'>
          <Collapse in={open} className="col-md-12" style={{padding: '0px', display: `${open ? 'block' : 'none'}`, margin: '5px 0 5px 15px'}}>
            <div style={{textAlign: 'left'}} className='gray-italics-small'>
              {`This ${resource} version is referenced in the following ${count} source and collection versions:`}
            </div>
            {
              map(associatedWith.source, uri => (
                <div className='col-md-12 no-right-padding' key={uri}>
                  <ConceptContainerLabel resource='source' {...getResourceDetails(uri)} />
                </div>
              ))
            }
            {
              map(associatedWith.collection, uri => {
                return (
                  <div className='col-md-12 no-right-padding' key={uri}>
                    <ConceptContainerLabel resource='collection' {...getResourceDetails(uri)} />
                  </div>
                )
              })
            }
          </Collapse>
          <CollapsibleDivider
            open={open}
            tooltip='View associations with Sources/Collections'
            onClick={toggleOpen}
          />
        </div>
      }
    </React.Fragment>
  )
}

export default SourceChildVersionAssociationWithContainer;
