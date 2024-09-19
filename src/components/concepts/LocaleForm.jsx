import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField, Checkbox, IconButton, FormControlLabel } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { find, get, orderBy, uniqBy, isString } from 'lodash'
import { ERROR_RED } from '../../common/constants';
import LocaleAutoComplete from '../common/LocaleAutoComplete';
import GroupHeader from '../common/GroupHeader';
import GroupItems from '../common/GroupItems';

const LocaleForm = ({
  localeAttr, index, onTextFieldChange, onAutoCompleteChange, onCheckboxChange, types,
  onDelete, error, locale, sourceVersionSummary, source, edit
}) => {
  const isName = localeAttr === 'fields.names';
  const nameAttr = isName ? 'name' : 'description';
  const typeAttr = `${nameAttr}_type`;
  const localeType = get(locale, typeAttr);
  const [selectedLocale, setSelectedLocale] = React.useState(
    locale.locale ? {id: locale.locale, name: locale.locale} : null
  )
  const autoIDConfigField = isName ? 'autoid_concept_name_external_id' : 'autoid_concept_description_external_id';
  const [manualExternalID, setManualExternalID] = React.useState(source?.id ? !source[autoIDConfigField] : true)
  let selectedLocaleType = localeType ? find(types, {id: locale[typeAttr]}) : null;
  const idPrefix = `${localeAttr}.${index}`;
  const borderColor = error ? ERROR_RED : 'lightgray'
  let formattedTypes = types;
  if(localeType && !selectedLocaleType) {
    const _type = {id: localeType, name: localeType, resultType: 'Suggested'}
    selectedLocaleType = _type
    formattedTypes = uniqBy(orderBy([_type, ...types], ['resultType', 'name'], ['desc', 'asc']), 'id')
  }

  const onLocaleChange = (event, item) => {
    setSelectedLocale(item)
    onAutoCompleteChange(`${idPrefix}.locale`, item)
  }

  React.useEffect(() => {
    if(get(locale, 'locale') && !selectedLocale)
      setSelectedLocale({id: locale.locale, name: locale.locale})
  }, [locale])


  const isOpenMRSValidationSchema = source?.custom_validation_schema?.toLowerCase() === 'openmrs';
  const ANCHOR_UNDERLINE_STYLES = {textDecoration: 'underline', cursor: 'pointer'}
  const toggleManualExternalId = () => {
    const newVal = !manualExternalID
    if(!newVal)
      onTextFieldChange({target: {id: `${idPrefix}.${nameAttr}`, value: ''}})
    setManualExternalID(newVal)
  }

  const shouldEnterManualExternalId = !manualExternalID && (edit ? !locale?.external_id : false)

  React.useEffect(() => {
    source?.id && setManualExternalID(!source[autoIDConfigField])
  }, [source])
  React.useEffect(() => {
    setSelectedLocale(locale?.locale ? {id: locale.locale, name: locale.locale} : null)
  }, [locale?.locale])

  return (
    <div className='col-md-12' style={{border: `1px solid ${borderColor}`, borderRadius: '4px', paddingBottom: '15px', width: '100%'}}>
      <div className='col-md-12 no-side-padding' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-md-10 no-side-padding'>
          <div className="col-md-6 no-left-padding">
            <LocaleAutoComplete
              id={`${idPrefix}.locale`}
              selected={selectedLocale}
              onChange={onLocaleChange}
              sourceVersionSummary={sourceVersionSummary}
              required
              label='Locale'
              size='small'
            />
          </div>
          <div className="col-md-6 no-left-padding">
            <Autocomplete
              freeSolo={!isOpenMRSValidationSchema}
              autoSelect={!isOpenMRSValidationSchema}
              openOnFocus
              value={selectedLocaleType}
              id={`${idPrefix}.${typeAttr}`}
              options={formattedTypes}
              getOptionLabel={(option) => isString(option) ? option : option.name}
              fullWidth
              groupBy={option => option.resultType}
              renderGroup={params => (
                <li style={{listStyle: 'none'}} key={params.group}>
                  <GroupHeader>{params.group}</GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              renderInput={(params) => <TextField {...params} size='small' label="Type" variant="outlined" fullWidth />}
              onChange={(event, item) => onAutoCompleteChange(`${idPrefix}.${typeAttr}`, isOpenMRSValidationSchema ? item : isString(item) ? {id: item} : item)}
            />
          </div>
          <div className="col-md-6 no-left-padding" style={{marginTop: '15px'}}>
            <TextField
              id={`${idPrefix}.${nameAttr}`}
              label={isName ? "Name" : "Description"}
              variant="outlined"
              fullWidth
              required
              onChange={onTextFieldChange}
              size='small'
              value={get(locale, nameAttr, '') || ''}
            />
          </div>
          <div className="col-md-6 no-left-padding" style={{marginTop: shouldEnterManualExternalId ? '5px' : '15px'}}>
            {
              shouldEnterManualExternalId ?
                <span style={{fontWeight: '500', padding: '10px 5px', display: 'inline-block'}}>
                  External ID will be auto-assigned (<a style={ANCHOR_UNDERLINE_STYLES} onClick={toggleManualExternalId}>click here</a> to override with manual entry)
                </span> :
              <TextField
                id={`${idPrefix}.external_id`}
                label="External ID"
                variant="outlined"
                fullWidth
                onChange={onTextFieldChange}
                size='small'
                value={get(locale, 'external_id', '') || ''}
              />
            }
          </div>
        </div>
        <div className='col-md-2 no-side-padding' style={{textAlign: 'right'}}>
          <div className="col-md-12">
            <FormControlLabel
              control={
                <Checkbox
                  checked={get(locale, 'locale_preferred', false)}
                  name="preferred"
                  onChange={event => onCheckboxChange(`${idPrefix}.locale_preferred`, event.target.checked)}
                />
              }
              label="Preferred"
            />
          </div>
          <div className="col-md-12">
            <IconButton onClick={() => onDelete(index)} size="large"><DeleteIcon /></IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocaleForm;
