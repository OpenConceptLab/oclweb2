import React from 'react';
import { map, isEmpty } from 'lodash';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import PinIcon from '../common/PinIcon';
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


const Pins = ({ pins, onDelete, canDelete, onOrderUpdate }) => {
  const [orderedPins, setPins] = React.useState(pins)
  const gridClassName = `col-md-3`;

  React.useEffect(() => {
    setPins(pins)
  }, [pins])

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
    <div className='col-md-12' style={{marginBottom: '10px'}}>
      {
        !isEmpty(orderedPins) &&
        <h3 style={{margin: '10px 5px', display: 'flex', alignItems: 'center'}}>
          <PinIcon pinned="true" fontSize='small' style={{marginRight: '5px'}} />
          Pinned
        </h3>
      }
      {
        !isEmpty(orderedPins) &&
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
                                className={gridClassName}
                                style={{padding: '0 5px', height: '150px'}}>
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
      }
    </div>
  );
}

export default Pins;
