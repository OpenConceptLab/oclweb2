import React from 'react';
import { useTranslation } from 'react-i18next'
import PasswordStrengthBar from 'react-password-strength-bar';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import {
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { get } from 'lodash';
import { isValidPassword } from '../../common/utils';
import HtmlTooltip from './HtmlTooltip';
import PasswordValidatorIndicator from './PasswordValidatorIndicator';

const PasswordFields = ({
  onChange, password, passwordErrors, passwordFieldId, confirmPasswordFieldId, onBlur
}) => {
  const { t } = useTranslation()
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
          title={<PasswordValidatorIndicator password={password} minStrengthLabel={t('common.good')} minStrength={minStrength} strength={strength} />}
        >
          <TextField
            required
            error={Boolean(passwordErrors || (password && !isValid))}
            helperText={get(passwordErrors, '0')}
            label={t('user.auth.password')}
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
                  <IconButton
                    onClick={handleClickShowPassword}
                    size="large">
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
          label={t('user.auth.confirm_password')}
          variant="outlined"
          id={confirmPasswordFieldId}
          onChange={onChange}
          type="password"
          fullWidth
        />
      </div>
      <PasswordStrengthBar password={password} minLength={8} className='password-strength' onChangeScore={strength => setStrength(strength)} />
    </React.Fragment>
  );
}

export default PasswordFields;
