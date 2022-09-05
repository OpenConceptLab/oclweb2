import React from 'react';
import {
  FormControlLabel, Checkbox
} from '@mui/material';
import CommonAccordion from '../../common/CommonAccordion';
import FormTooltip from '../../common/FormTooltip';


const Expansions = props => {
  const configs = props.advanceSettings.expansions
  const [autoexpandHEAD, setAutoexpandHEAD] = React.useState(true)
  const onChange = value => {
    setAutoexpandHEAD(value)
    props.onChange({autoexpand_head: value})
  }
  const defaultExpanded = props.edit && !props.repo.autoexpand_head

  React.useEffect(() => props.edit && setAutoexpandHEAD(props.repo.autoexpand_head || false), [])

  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle} defaultExpanded={defaultExpanded}>
      <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '10px'}}>
        <FormControlLabel
          control={<Checkbox checked={autoexpandHEAD} onChange={event => onChange(event.target.checked)} />}
          label={configs.autoexpandHEAD.label}
          disabled={props.edit}
        />
        <FormTooltip title={configs.autoexpandHEAD.tooltip} style={{marginLeft: '10px'}} />

      </div>
    </CommonAccordion>
  )
}

export default Expansions;
