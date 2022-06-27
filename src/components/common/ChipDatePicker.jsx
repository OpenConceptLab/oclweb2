import React from 'react';
import { DatePicker, PickersDay } from "@mui/lab";
import { Tooltip, Badge, TextField } from '@mui/material';
import { isEmpty, get } from 'lodash';


const ChipDatePicker = props => {
  const ref = React.useRef(null);
  const [value, setValue] = React.useState('')
  const { date, defaultValue, badgedDates } = props;
  const onChange = mDate => {
    let date = null;
    if(mDate)
      date = mDate.format('YYYY-MM-DD')

    if(value || date)
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

  React.useEffect(
    () => setValue(defaultValue || date || ''), [defaultValue]
  )

  React.useEffect(
    () => setValue(defaultValue || date || ''), [date]
  )


  const getComponent = () => {
    return (
      <span id='chip-date-picker'>
          <DatePicker
            autoOk
            disableFuture
            openTo='day'
            views={['year', 'month', 'day']}
            variant="inline"
            renderInput={
              params => <TextField size='small' {...params} error={false} />
            }
            value={value}
            onChange={onChange}
            inputFormat="MM/DD/YYYY"
            PopoverProps={{
              anchorEl: ref.current
            }}
            renderDay={renderDay}
          />
      </span>
    )
  }

  return (
      props.tooltip ?
        <Tooltip arrow title={props.tooltip}>
          {getComponent()}
        </Tooltip> :
      getComponent()
  )
}

export default ChipDatePicker;
