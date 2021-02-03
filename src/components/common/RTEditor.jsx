import React from 'react';
import RichTextEditor from 'react-rte';

const getTextAlignClassName = (contentBlock) => {
  switch (contentBlock.getData().get('textAlign')) {
    case 'ALIGN_LEFT':
      return 'text-align--left';

    case 'ALIGN_CENTER':
      return 'text-align--center';

    case 'ALIGN_RIGHT':
      return 'text-align--right';

    case 'ALIGN_JUSTIFY':
      return 'text-align--justify';

    default:
      return '';
  }
};

class RTEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue ?
             this.getValueFromDefault() :
             RichTextEditor.createEmptyValue(),
    }
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.defaultValue && this.props.defaultValue)
      this.setState({value: this.getValueFromDefault()})
  }

  getValueFromDefault() {
    return RichTextEditor.createValueFromString(this.props.defaultValue, 'html')
  }

  onChange = value => this.setState(
    {value: value}, () => this.props.onChange(value.toString('html'))
  )

  render() {
    const { value } = this.state;
    const { label, placeholder } = this.props
    return (
      <React.Fragment>
        <div className='col-md-12'>
          <h3>{label}</h3>
        </div>
        <div className='col-md-12 no-side-padding'>
          <RichTextEditor
            value={value}
            onChange={this.onChange}
            className='rte-editor'
            placeholder={placeholder}
            toolbarClassName="demo-toolbar"
            editorClassName="demo-editor"
            blockStyleFn={getTextAlignClassName}
          />
        </div>
      </React.Fragment>
    )
  }
}

export default RTEditor;
