import React from 'react';
import { Chip, Tooltip } from '@material-ui/core';
import { Schedule, Cancel } from '@material-ui/icons';
import './ChipDatePicker.scss';

class ChipDatePicker extends React.Component {
  onChange = event => {
    const date = event.target.value;
    this.props.onChange(date);
  }

  render() {
    const { label, size, date, defaultValue } = this.props;
    return (
      <Tooltip title='Updated Since'>
        <span id='chip-date-picker'>
          <span id='hidden-date-html5'>
            <input
              className='hidden-date'
              type="date" value={defaultValue || ''}
              onChange={this.onChange}
            style={date ? {height: '30px', width: '170px'} : {}}
            />
            <Chip
              icon={<Schedule />}
              id='calendarText'
              label={ label }
              deleteIcon={
                date ? <Cancel style={{zIndex: 2}} /> : null
              }
              onDelete={date ? () => this.onChange({target: {value: false}}) : null}
              variant={date ? "default" : "outlined"}
              clickable
              color={date ? "primary" : "secondary"}
              className="calendar-custom-date-button"
              size={size || 'medium'}
            />
          </span>
        </span>
      </Tooltip>
    );
  }
}

export default ChipDatePicker;
