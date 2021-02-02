import React from 'react';
import RichTextEditor from 'react-rte';

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
          />
        </div>
      </React.Fragment>
    )
  }
}

export default RTEditor;
