import React from 'react';
import {
  CheckCircle as CorrectIcon, Cancel as WrongIcon
} from '@material-ui/icons';
import { ERROR_RED, BLUE } from '../../common/constants';
import { merge } from 'lodash';

const correctIcon = <CorrectIcon color='primary' fontSize='inherit'/>;
const incorrectIcon = <WrongIcon fontSize='inherit' style={{color: ERROR_RED}}/>;
const Indicator = (predicate, label) => {
  const commonSpanStyles = {marginLeft: '5px'}
  const getStyles = predicate => predicate ? {color: BLUE} : {color: ERROR_RED};

  return (
    <div className='flex-vertical-center'>
      {
        predicate ? correctIcon : incorrectIcon
      }
      <span style={merge(commonSpanStyles, getStyles(predicate))}>
        {label}
      </span>
    </div>
  )}

const PasswordValidatorIndicator = ({password, strength, minStrength, minStrengthLabel}) => {
  const hasMinLength = Boolean(password && password.length >= 8)
  const hasNumber = Boolean(password && password.match(new RegExp(/[0-9]/g)))
  const hasAlphabet = Boolean(password && password.match(new RegExp(/[a-zA-Z]/g)))
  const isMinStrength = strength >= minStrength

  return (
    <React.Fragment>
      <div className='col-md-12 no-side-padding' style={{fontSize: '12px'}}>
        {
          Indicator(hasMinLength, 'Must be 8 or more characters.')
        }
        {
          Indicator(hasNumber, 'Must have at least one number (0-9).')
        }
        {
          Indicator(hasAlphabet, 'Must have at least one letter (a-z, A-Z).')
        }
        {
          minStrength && Indicator(isMinStrength, `Must be of ${minStrengthLabel} strength.`)
        }
      </div>
    </React.Fragment>
  )
}

export default PasswordValidatorIndicator;
