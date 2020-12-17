import React from 'react';
import { map, isEmpty, get } from 'lodash';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import PinIcon from '../common/PinIcon';
import Pin from './Pin';

const getGridDivision = pinsCount => {
  let division = 12;
  if(pinsCount < 3)
    return 6
  return Math.floor(division/pinsCount);
}
const getItemStyle = (draggableStyle, isDragging) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  opacity: isDragging ? 0.5 : 1,
  // styles we need to apply on draggables
  ...draggableStyle
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
  let gridDivision = getGridDivision(get(orderedPins, 'length', 0));
  const gridClassName = `col-md-${gridDivision}`

  React.useEffect(() => {
    setPins(pins)
  }, [pins])

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      orderedPins,
      result.source.index,
      result.destination.index
    );

    onOrderUpdate(parseInt(result.draggableId), result.destination.index)

    setPins(items);
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
                                  style={getItemStyle(
                                      provided.draggableProps.style,
                                      snapshot.isDragging
                                  )}
                                >
                                  <Pin pin={pin} onDelete={onDelete} canDelete={canDelete} />
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
