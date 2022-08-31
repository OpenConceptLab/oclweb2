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
  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle}>
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
