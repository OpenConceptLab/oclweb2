import React from 'react';
import { DatePicker, PickersDay } from "@mui/lab";
import { Chip, Tooltip, Badge } from '@mui/material';
import { Schedule, Cancel } from '@mui/icons-material';
import { isEmpty, get } from 'lodash';


const ChipDatePicker = props => {
  const ref = React.useRef(null);
  const { label, size, date, defaultValue, badgedDates } = props;
  const onChange = mDate => {
    let date = null;
    if(mDate)
      date = mDate.format('YYYY-MM-DD')
    props.onChange(date);
  }
  const renderDay = (date, selectedDate, DayComponentProps) => {
    if(!badgedDates || isEmpty(badgedDates))
      return <PickersDay {...DayComponentProps} />;
    const fSelectedDate = selectedDate.format('DD-MM-YYYY')
    const fDate = date.format('DD-MM-YYYY')
    const count = get(badgedDates, fDate)
    if(count && fDate !== fSelectedDate) {
      return (
        <Tooltip title={`${count} imports`} arrow>
          <Badge badgeContent={count} color="primary" variant="dot" overlap="circular">
            <PickersDay {...DayComponentProps} />
          </Badge>
        </Tooltip>
      );
    }
    return <PickersDay {...DayComponentProps} />;
  }

  const onClick = (event, _onChange) => {
    const input = document.getElementById('hidden-date-input')
    _onChange({target: input})
    const div = input.nextElementSibling
    if(div) {
      const button = get(div, 'children.0')
      if(button) {
        button.click()
      }
    }
  }

  return (
    <Tooltip arrow title={props.tooltip || 'Updated Since'}>
      <span id='chip-date-picker'>
        <span id='hidden-date-html5'>
          <DatePicker
            autoOk
            disableFuture
            openTo='day'
            views={['year', 'month', 'day']}
            variant="inline"
            renderInput={
              ({ inputRef, inputProps, InputProps }) => <span>
                <Chip
                  icon={<Schedule />}
                       id='calendarText'
                       label={ label || 'All Time' }
                       deleteIcon={
                         date ? <Cancel style={{zIndex: 2}} /> : null
                       }
                       onDelete={date ? () => onChange(false) : null}
                       variant="outlined"
                       clickable
                       color={date ? "primary" : "secondary"}
                       className="calendar-custom-date-button"
                       size={size || 'medium'}
                       ref={inputRef}
onClick={event => onClick(event, inputProps.onChange)}
                />
                <input id='hidden-date-input' {...inputProps} />
                {InputProps?.endAdornment}
              </span>
            }
            value={defaultValue || date || new Date()}
            onChange={onChange}
            inputFormat="MM/DD/YYYY"
            PopoverProps={{
              anchorEl: ref.current
            }}
            renderDay={renderDay}
          />
        </span>
      </span>
    </Tooltip>
  )
}

export default ChipDatePicker;
