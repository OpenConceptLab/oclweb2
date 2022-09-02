import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { cloneDeep, map, pullAt, isEmpty } from 'lodash';
import CommonAccordion from '../../common/CommonAccordion';
import ExtrasForm from '../../common/ExtrasForm';
import { arrayToObject } from '../../../common/utils';

const JSON_MODEL = {key: '', value: ''}

const CustomAttributes = props => {
  const configs = props.advanceSettings.customAttributes
  const [extras, setExtras] = React.useState([cloneDeep(JSON_MODEL)])
  const onAddExtras = () => setExtras([...extras, cloneDeep(JSON_MODEL)])
  const onDeleteExtras = index => {
    const newExtras = cloneDeep(extras)
    pullAt(newExtras, index)
    setExtras(newExtras)
    props.onChange({extras: arrayToObject(newExtras)}, 'extras')
  }
  const onExtrasChange = (index, key, value) => {
    const newExtras = cloneDeep(extras)
    if(key !== '__')
      newExtras[index].key = key
    if(value !== '__')
      newExtras[index].value = value
    setExtras(newExtras)
    props.onChange({extras: arrayToObject(newExtras)}, 'extras')
  }
  const setFieldsForEdit = () => !isEmpty(props.repo.extras) && setExtras(map(props.repo.extras, (v, k) => ({key: k, value: v})))
  const defaultExpanded = props.edit && !isEmpty(props.repo.extras)

  React.useEffect(() => props.edit && setFieldsForEdit(), [])


  return (
    <CommonAccordion square title={configs.title} subTitle={configs.subTitle} defaultExpanded={defaultExpanded}>
      <React.Fragment>
        {
          map(extras, (extra, index) => (
            <div className='col-xs-12 no-side-padding' key={index} style={index > 0 ? {marginTop: '5px'} : {}}>
              <ExtrasForm
                extra={extra}
                index={index}
                onChange={onExtrasChange}
                onDelete={onDeleteExtras}
              />
            </div>
          ))
        }
        <div className='col-xs-12 no-side-padding' onClick={onAddExtras} style={{marginTop: '5px'}}>
          <Button variant='text' startIcon={<AddIcon />} size='small'>
            Add Attribute
          </Button>
        </div>
      </React.Fragment>
    </CommonAccordion>
  )
}

export default CustomAttributes;
