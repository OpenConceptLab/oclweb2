import React from 'react';
import { map, isEmpty, compact, values } from 'lodash';
import { Divider, IconButton, Collapse, Tooltip } from '@material-ui/core';
import { ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@material-ui/icons';
import { BLUE } from '../../common/constants';
import ConceptContainerLabel from './ConceptContainerLabel';

const LIGHT_GRAY = 'rgba(0, 0, 0, 0.12)';
const SourceChildVersionAssociationWithContainer = ({ associatedWith }) => {
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
          <Collapse in={open} className="col-md-12" style={{padding: '0px', display: `${open ? 'block' : 'none'}`, margin: '5px 0 5px 100px'}}>
            <div style={{textAlign: 'left'}} className='gray-italics-small'>
              {`Associated with ${count}`}
            </div>
            {
              map(associatedWith.source, uri => {
                return (
                  <div className='col-md-12 no-right-padding' key={uri}>
                    <ConceptContainerLabel resource='source' {...getResourceDetails(uri)} />
                  </div>
                )
              })
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
          <div className='col-md-12 no-side-padding flex-vertical-center'>
            <Divider style={{width: '48%', backgroundColor: open ? BLUE : LIGHT_GRAY}} />
            <Tooltip title='View associations with Sources/Collections' arrow>
              <IconButton onClick={toggleOpen} color={open ? 'primary' : 'default'} size='small' style={{border: '1px solid', borderColor: open ? BLUE : LIGHT_GRAY}}>
                {open ? <UpIcon fontSize='inherit' /> : <DownIcon fontSize='inherit' />}
              </IconButton>
            </Tooltip>
            <Divider style={{width: '48%', backgroundColor: open ? BLUE : LIGHT_GRAY}} />
          </div>
        </div>
      }
    </React.Fragment>
  )
}

export default SourceChildVersionAssociationWithContainer;
