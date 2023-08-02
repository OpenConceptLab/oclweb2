import React from 'react';
import { useTranslation } from 'react-i18next'
import {
  CheckCircle as CorrectIcon, Cancel as WrongIcon
} from '@mui/icons-material';
import { ERROR_RED, BLUE } from '../../common/constants';
import { merge } from 'lodash';

const correctIcon = <CorrectIcon color='primary' fontSize='inherit'/>;
const incorrectIcon = <WrongIcon fontSize='inherit' style={{color: ERROR_RED}}/>;
const { t } = useTranslation()
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
  const { t } = useTranslation()

  return (
    <React.Fragment>
      <div className='col-md-12 no-side-padding' style={{fontSize: '12px'}}>
        {
          Indicator(hasMinLength, t('user.auth.password_length_error'))
        }
        {
          Indicator(hasNumber, t('user.auth.password_number_error'))
        }
        {
          Indicator(hasAlphabet, t('user.auth.password_alpha_error'))
        }
        {
          minStrength && Indicator(isMinStrength, t('user.auth.password_strength_error', {strength: minStrengthLabel}))
        }
      </div>
    </React.Fragment>
  )
}

export default PasswordValidatorIndicator;
