import React from 'react';
import PasswordStrengthBar from 'react-password-strength-bar';
import { TextField } from '@material-ui/core';
import { get } from 'lodash';
import HtmlTooltip from './HtmlTooltip';
import PasswordValidatorIndicator from './PasswordValidatorIndicator';

const PasswordFields = ({
  onChange, password, passwordErrors, passwordFieldId, confirmPasswordFieldId
}) => {
  const [tooltip, setTooltip] = React.useState(false);
  const onBlur = () => setTooltip(true);
  const onFocus = () => setTooltip(true)
  return (
    <React.Fragment>
      <div style={{marginTop: '10px'}}>
        <HtmlTooltip
          arrow
          placement='right'
          open={tooltip}
          title={<PasswordValidatorIndicator password={password} />}
        >
          <TextField
            required
            error={Boolean(passwordErrors)}
            helperText={get(passwordErrors, '0')}
            label="Password"
            variant="outlined"
            id={passwordFieldId}
            onChange={onChange}
            type="password"
            fullWidth
            onFocus={onFocus}
            onBlur={onBlur}
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
      <PasswordStrengthBar password={password} minLength={8} className='password-strength' />
    </React.Fragment>
  )
}

export default PasswordFields;
