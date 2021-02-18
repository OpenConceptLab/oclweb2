import React from 'react';
import PasswordStrengthBar from 'react-password-strength-bar';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import {
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
} from '@material-ui/icons';
import { get } from 'lodash';
import { isValidPassword } from '../../common/utils';
import HtmlTooltip from './HtmlTooltip';
import PasswordValidatorIndicator from './PasswordValidatorIndicator';

const PasswordFields = ({
  onChange, password, passwordErrors, passwordFieldId, confirmPasswordFieldId, onBlur
}) => {

  const [tooltip, setTooltip] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [strength, setStrength] = React.useState(null);
  const minStrength = 3;
  const isValid = isValidPassword(password, strength, minStrength)
  const onPasswordBlur = () => {
    onBlur(isValid)
    setTooltip(true)
  };
  const onFocus = () => setTooltip(true)
  const handleClickShowPassword = () => setShowPassword(prev => !prev)
  return (
    <React.Fragment>
      <div style={{marginTop: '10px'}}>
        <HtmlTooltip
          arrow
          placement='right'
          open={tooltip}
          title={<PasswordValidatorIndicator password={password} minStrengthLabel='Good' minStrength={minStrength} strength={strength} />}
        >
          <TextField
            required
            error={Boolean(passwordErrors || (password && !isValid))}
            helperText={get(passwordErrors, '0')}
            label="Password"
            variant="outlined"
            id={passwordFieldId}
            onChange={onChange}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            onFocus={onFocus}
            onBlur={onPasswordBlur}
            InputProps={{
              endAdornment:(
                <InputAdornment position="end">
                  <IconButton aria-label="Toggle password visibility" onClick={handleClickShowPassword}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </HtmlTooltip>
      </div>
      <div style={{marginTop: '10px'}}>
        <TextField
          required
          label="Confirm Password"
          variant="outlined"
          id={confirmPasswordFieldId}
          onChange={onChange}
          type="password"
          fullWidth
        />
      </div>
      <PasswordStrengthBar password={password} minLength={8} className='password-strength' onChangeScore={strength => setStrength(strength)} />
    </React.Fragment>
  )
}

export default PasswordFields;
