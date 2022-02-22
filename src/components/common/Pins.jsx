import React from 'react';
import { map, isEmpty, merge } from 'lodash';
import { Collapse, Badge } from '@mui/material';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { BLUE } from '../../common/constants';
import PinIcon from './PinIcon';
import Pin from './Pin';

const getPinStyle = isDragging => ({
  backgroundColor: isDragging ? 'rgba(255,255,255,0.7)' : '#fff',
  boxShadow: isDragging ? '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)' : 'none',
})
const getItemStyle = draggableStyle => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  // styles we need to apply on draggables
  height: '150px',
  ...draggableStyle,
});
const getListStyle = () => ({
  display: 'flex',
  overflow: 'hidden',
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const Pins = ({ pins, onDelete, canDelete, onOrderUpdate, style }) => {
  const [orderedPins, setPins] = React.useState(pins)
  const [show, setShow] = React.useState(true)

  React.useEffect(() => setPins(pins), [pins])

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    if(result.source.index !== result.destination.index) {
      const items = reorder(
        orderedPins,
        result.source.index,
        result.destination.index
      );
      onOrderUpdate(parseInt(result.draggableId), result.destination.index)
      setPins(items);
    }
  }

  return (
    <div className='col-md-12' style={merge({marginBottom: '5px'}, style || {})}>
      {
        !isEmpty(orderedPins) &&
        <span className='flex-vertical-center'>
          <h3 style={{margin: '10px 0px', display: 'flex', alignItems: 'center'}}>
            <Badge color='primary' anchorOrigin={{horizontal: 'left', vertical: 'top'}} variant='dot' invisible={show}>
              <PinIcon pinned="true" fontSize='small' style={{marginRight: '5px'}} />
            </Badge>
            Pinned
          </h3>
          <span style={{cursor: 'pointer', textDecoration: 'underline', marginLeft: '10px', color: BLUE, fontSize: '12px'}} onClick={() => setShow(!show)}>
            {show ? 'hide' : 'show'}
          </span>
        </span>
      }
      {
        !isEmpty(orderedPins) &&
        <Collapse in={show} timeout="auto" unmountOnExit>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction="horizontal" isDropDisabled={!canDelete}>
              {
                (provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}>
                    {
                      map(orderedPins, (pin, index) => {
                        return (
                          <Draggable
                            key={pin.id}
                            draggableId={pin.id.toString()}
                            index={index}
                            isDragDisabled={!canDelete}
                            >
                            {
                              (provided, snapshot) => (
                                <div
                                  className='col-md-3'
                                  style={{padding: 0, paddingRight: '5px', height: '150px'}}>
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.dragHandleProps}
                                    {...provided.draggableProps}
                                    style={getItemStyle(provided.draggableProps.style)}
                                  >
                                    <Pin pin={pin} onDelete={onDelete} canDelete={canDelete} style={getPinStyle(snapshot.isDragging)} />
                                  </div>
                                  {provided.placeholder}
                                </div>
                              )
                            }
                          </Draggable>
                        )
                      })
                    }
                    {provided.placeholder}
                  </div>
                )
              }
            </Droppable>
          </DragDropContext>
        </Collapse>
      }
    </div>
  );
}

export default Pins;
