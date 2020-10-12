import React from 'react';
import { Chip } from '@material-ui/core';
import { Schedule, Cancel } from '@material-ui/icons';
import './ChipDatePicker.scss';

class ChipDatePicker extends React.Component {
  onChange = event => {
    const date = event.target.value;
    this.props.onChange(date);
  }

  render() {
    const { label, size, date } = this.props;
    return (
      <span id='chip-date-picker'>
        <span id='hidden-date-html5'>
          <input className='hidden-date' type="date" onChange={this.onChange} />
          <Chip
            icon={<Schedule />}
            id='calendarText'
            label={ label }
            deleteIcon={
              date ? <Cancel style={{zIndex: 2}} /> : null
            }
            onDelete={date ? () => this.onChange({target: {value: false}}) : null}
            variant="outlined"
            clickable
            style={{minWidth: '100px'}}
            color={date ? "primary" : "default"}
            className="calendar-custom-date-button"
            size={size || 'medium'}
          />
        </span>
      </span>
    );
  }
}

export default ChipDatePicker;
