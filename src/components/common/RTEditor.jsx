import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

class RTEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue || '',
    }
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.defaultValue && this.props.defaultValue)
      this.setState({value: this.props.defaultValue})
  }

  onChange = value => this.setState({value: value}, () => this.props.onChange(value))

  render() {
    const { value } = this.state;
    const { label, placeholder } = this.props
    return (
      <React.Fragment>
        <div className='col-md-12'>
          <h3>{label}</h3>
        </div>
        <div className='col-md-12 no-side-padding'>
          <ReactQuill
            theme="snow"
            value={value}
            modules={RTEditor.modules}
            onChange={this.onChange}
            placeholder={placeholder}
          />
        </div>
      </React.Fragment>
    )
  }
}

RTEditor.modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link',],
    ['clean'],
    [{ 'align': [] }]
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  }
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
RTEditor.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

export default RTEditor;
