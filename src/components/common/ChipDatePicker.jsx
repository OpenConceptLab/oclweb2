import React from 'react';
import { DatePicker } from "@material-ui/pickers";
import { Chip, Tooltip, Badge } from '@material-ui/core';
import { Schedule, Cancel } from '@material-ui/icons';
import { isEmpty, get } from 'lodash';


const ChipDatePicker = props => {
  const ref = React.useRef(null);
  const { label, size, date, defaultValue, badgedDates } = props;
  const clickHidden = () => document.getElementById('hidden-chip-date-picker').click()
  const onChange = mDate => {
    let date = null;
    if(mDate)
      date = mDate.format('YYYY-MM-DD')
    props.onChange(date);
  }
  const renderDay = (date, selectedDate, dayInCurrentMonth, dayComponent) => {
    if(!badgedDates || isEmpty(badgedDates))
      return dayComponent
    const fSelectedDate = selectedDate.format('DD-MM-YYYY')
    const fDate = date.format('DD-MM-YYYY')
    const count = get(badgedDates, fDate)
    if(count && fDate !== fSelectedDate) {
      return (
        <Tooltip title={`${count} imports`} arrow>
          <Badge badgeContent={count} color="primary" variant="dot" overlap="circle">
            {dayComponent}
          </Badge>
        </Tooltip>
      )
    }
    return dayComponent;
  }

  return (
    <Tooltip arrow title={props.tooltip || 'Updated Since'}>
      <span id='chip-date-picker'>
        <span id='hidden-date-html5'>
          <Chip
            icon={<Schedule />}
            id='calendarText'
            label={ label }
            deleteIcon={
              date ? <Cancel style={{zIndex: 2}} /> : null
            }
            onDelete={date ? () => onChange(false) : null}
            variant="outlined"
            clickable
            color={date ? "primary" : "secondary"}
            className="calendar-custom-date-button"
            size={size || 'medium'}
            onClick={clickHidden}
            ref={ref}
          />
          <DatePicker
            autoOk
            disableFuture
            id='hidden-chip-date-picker'
            variant="inline"
            label="Only calendar"
            helperText="No year selection"
            value={defaultValue || date || ''}
            onChange={onChange}
            views={["year", "month", "date"]}
            format="MM/DD/YYYY"
            style={{display: 'none'}}
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
