import React from 'react';
import CommonAccordion from '../../common/CommonAccordion';
import RTEditor from '../../common/RTEditor';


const AboutPage = props => {
  const configs = props.advanceSettings.about
  const [text, setText] = React.useState('')
  const onChange = value => {
    setText(value)
    props.onChange({text: value})
  }
  const defaultExpanded = props.edit && props.repo.text

  React.useEffect(() => props.edit && setText(props.repo.text || ''), [])

  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle} defaultExpanded={defaultExpanded}>
      <div className='col-xs-12 no-side-padding' style={{marginTop: '10px'}}>
        <RTEditor
          onChange={onChange}
          defaultValue={text}
          placeholder={`About ${props.resource}`}
        />
      </div>
    </CommonAccordion>
  )
}

export default AboutPage;
