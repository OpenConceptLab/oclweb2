import React from 'react';
import alertifyjs from 'alertifyjs';
import { Close as CloseIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import {
  FormControlLabel, Checkbox, IconButton, Tooltip, TextField, InputAdornment, Button
} from '@mui/material';
import { startCase, set, cloneDeep, isEmpty, isString } from 'lodash';
import APIService from '../../services/APIService';

class OverviewSettings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      logo: true,
      controls: true,
      signatures: true,
      height: 140,
      background: {
        image: '',
        imageOverlay: false,
        backgroundColor: ''
      },
      forground: {
        color: '',
        title: props.org.name,
        titleColor: '',
        description: props.org.description,
        descriptionColor: '',
        descriptionWidth: 40,
      }
    }
  }

  componentDidMount() {
    const { org } = this.props
    if(!isEmpty(org.overview)) {
      let descriptionWidth = org.overview.forground.descriptionWidth
      let height = org.overview.height
      if(isString(descriptionWidth)) {
        descriptionWidth = parseInt(descriptionWidth.replace('%'))
      }
      if(isString(height)) {
        height = parseInt(height.replace('px'))
      }
      this.setState({...org.overview, height: height, forground: {...org.overview, descriptionWidth: descriptionWidth}})
    }
  }

  onCheckboxChange = event => this.setFieldValue(event.target.id, event.target.checked)
  onTextFieldChange = event => this.setFieldValue(event.target.id, event.target.value)

  formatValues = () => {
    const values = cloneDeep({...this.state})
    values.forground.descriptionWidth = `${values.forground.descriptionWidth}%`
    values.height = `${values.height}px`
    return values
  }

  setFieldValue = (id, value) => {
    const newState = {...this.state}
    set(newState, id, value)
    this.setState(newState, () => this.props.onChange(this.formatValues()))
  }

  getInfo = tooltip => (
    <Tooltip arrow title={tooltip}>
      <InfoIcon color='secondary' fontSize='small' />
    </Tooltip>
  )

  getCheckboxControl = (id, label, disabled) => (
    <FormControlLabel
      style={{marginRight: '10px'}}
      label={label || startCase(id)}
      control={
        <Checkbox disabled={disabled} size='small' id={id} onChange={this.onCheckboxChange} checked={this.state[id]} />
      }
    />
  )

  getColorField = (id, label, state) => (
    <React.Fragment>
      <TextField
        label={label}
        placeholder='Accepts hex, rgb, rgba, text'
        id={id}
        value={state}
        onChange={this.onTextFieldChange}
        margin="dense"
        fullWidth
      />
      <span style={{marginLeft: '10px', width: "123px", height: '40px', borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.2)', backgroundColor: state}} />
    </React.Fragment>
  )

  onSave = () => {
    APIService.orgs(this.props.org.id).appendToUrl('overview/').put({overview: this.formatValues()}).then(() => {
      alertifyjs.success('Successfully Updated!')
      this.props.onCancel()
    })
  }

  render() {
    const { onCancel } = this.props;
    return (
      <div className='col-md-12' style={{marginBottom: '30px', textAlign: 'left'}}>
        <div className='col-md-12 no-side-padding flex-vertical-center' style={{justifyContent: 'space-between'}}>
          <h2>Manage Overview</h2>
          <span>
            <IconButton onClick={onCancel}>
              <CloseIcon fontSize='inherit' />
            </IconButton>
          </span>
        </div>
        <div className='col-md-12 no-side-padding flex-vertical-center' style={{flexDirection: 'column'}}>
          <fieldset style={{border: `1px solid rgba(0, 0, 0, 0.3)`, width: '100%', borderRadius: '4px'}}>
            <legend style={{color: 'rgba(0, 0, 0, 0.6)'}}>&nbsp; General &nbsp;</legend>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <TextField
                label='Banner Height'
                type='number'
                id='height'
                InputProps={{
                  inputProps: { min: 80, max: 600 },
                  endAdornment: (
                    <InputAdornment position="end">
                      px
                    </InputAdornment>
                  )
                }}
                value={this.state.height}
                onChange={this.onTextFieldChange}
                margin="dense"
                fullWidth
              />
            </div>
            <div className='col-xs-6 no-side-padding flex-vertical-center'>
              { this.getCheckboxControl('logo') }
              { this.getInfo('Select this to show organization logo in the banner') }
            </div>
            <div className='col-xs-6 no-side-padding flex-vertical-center'>
              { this.getCheckboxControl('controls') }
              { this.getInfo('Select this to show download, edit, copy controls in the banner') }
            </div>
            <div className='col-xs-6 no-side-padding flex-vertical-center'>
              { this.getCheckboxControl('signatures') }
              { this.getInfo('Select this to show createdAt/updatedAt and createdBy/updatedBy in the banner') }
            </div>
          </fieldset>
          <fieldset style={{border: `1px solid rgba(0, 0, 0, 0.3)`, width: '100%', borderRadius: '4px', marginTop: '10px'}}>
            <legend style={{color: 'rgba(0, 0, 0, 0.6)'}}>&nbsp; Background &nbsp;</legend>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <TextField
                type='url'
                label='Background Image URL'
                id='background.image'
                value={this.state.background.image}
                onChange={this.onTextFieldChange}
                margin="dense"
                fullWidth
              />
              <span style={{marginLeft: '10px'}}>
                {
                  this.getCheckboxControl('background.imageOverlay', 'Overlay', !this.state.background.image)
                }
              </span>
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              {
                this.getColorField(
                  'background.backgroundColor',
                  'Background Color',
                  this.state.background.backgroundColor
                )
              }
            </div>
          </fieldset>
          <fieldset style={{border: `1px solid rgba(0, 0, 0, 0.3)`, width: '100%', borderRadius: '4px', marginTop: '10px'}}>
            <legend style={{color: 'rgba(0, 0, 0, 0.6)'}}>&nbsp; Foreground &nbsp;</legend>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              {
                this.getColorField(
                  'forground.color',
                  'Text Color',
                  this.state.forground.color
                )
              }
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <TextField
                label='Title'
                id='forground.title'
                value={this.state.forground.title}
                onChange={this.onTextFieldChange}
                margin="dense"
                fullWidth
              />
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              {
                this.getColorField(
                  'forground.titleColor',
                  'Title Color',
                  this.state.forground.titleColor
                )
              }
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <TextField
                label='Description'
                id='forground.description'
                value={this.state.forground.description}
                onChange={this.onTextFieldChange}
                margin="dense"
                fullWidth
              />
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              {
                this.getColorField(
                  'forground.descriptionColor',
                  'Description Color',
                  this.state.forground.descriptionColor
                )
              }
            </div>
            <div className='col-xs-12 no-side-padding flex-vertical-center'>
              <TextField
                label='Description Width'
                type='number'
                id='forground.descriptionWidth'
                InputProps={{
                  inputProps: { min: 25, max: 100 },
                  endAdornment: (
                    <InputAdornment position="end">
                      %
                    </InputAdornment>
                  )
                }}
                value={this.state.forground.descriptionWidth}
                onChange={this.onTextFieldChange}
                margin="dense"
                fullWidth
              />
            </div>
          </fieldset>
          <div className='col-xs-12 no-side-padding flex-vertical-center' style={{margin: '10px', justifyContent: 'center'}}>
            <Button color='primary' variant='outlined' style={{margin: '0 10px'}} onClick={this.onSave}>
              Save
            </Button>
            <Button color='secondary' variant='outlined' onClick={onCancel} style={{margin: '0 10px'}}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

export default OverviewSettings;
