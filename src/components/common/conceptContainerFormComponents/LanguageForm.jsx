import React from 'react';
import {
  Button
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchLocales } from '../../../common/utils';
import { get, map, find, filter, includes, forEach, compact, flatten, uniqBy } from 'lodash';
import FormTooltip from '../../common/FormTooltip';
import LocaleAutoComplete from '../../common/LocaleAutoComplete'

const LanguageForm = props => {
  const [locales, setLocales] = React.useState([])
  const [showSupportedLocales, setShowSupportedLocales] = React.useState(false)
  const [defaultLocale, setDefaultLocale] = React.useState(null)
  const [supportedLocales, setSupportedLocales] = React.useState([])
  const onChange = (id, value, setter, propogateValue) => {
    setter(value)
    props.onChange({[id]: propogateValue === undefined ? value : propogateValue})
  }
  const configs = props.language
  const setUp = () => {
    fetchLocales(_locales => {
      let __locales = [..._locales]
      if(props.edit) {
        forEach(compact(flatten(compact([props.repo.default_locale, props.repo.supported_locales]))), _locale => {
          if(!find(_locales, {id: _locale}))
            __locales.push({id: _locale, displayName: _locale, name: _locale})
        })
      }
      setLocales(__locales)
      if(props.edit) {
        setDefaultLocale(find(__locales, {id: props.repo.default_locale}))
        if(props.repo.supported_locales) {
          setShowSupportedLocales(true)
          setSupportedLocales(uniqBy(filter(__locales, _locale => includes(props.repo.supported_locales, _locale.id)), 'id'))
        }
      }
    }, true)
  }

  React.useEffect(setUp, [])

  return (
    <div className='col-xs-12 no-side-padding' style={{margin: '-5px 0 20px 0'}}>
      <div className='col-xs-12 no-side-padding'>
        <h2>{configs.title}</h2>
      </div>
      <div className='col-xs-12 no-side-padding' style={{marginBottom: '15px'}}>
        <div className='col-xs-12 no-side-padding form-text-gray'>
          {configs.subTitle}
        </div>
      </div>
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        <LocaleAutoComplete
          cachedLocales={locales}
          label={configs.defaultLanguage.label}
          size='small'
          required
          value={defaultLocale}
          onChange={(id, item) => onChange('default_locale', item, setDefaultLocale, get(item, 'id'))}
        />
        <FormTooltip title={configs.defaultLanguage.tooltip} style={{marginLeft: '10px'}} />
      </div>
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        {
          showSupportedLocales ?
            <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px'}}>
              <LocaleAutoComplete
                cachedLocales={locales}
                multiple
                filterSelectedOptions
                label={configs.supportedLanguages.label}
                size='small'
                value={supportedLocales}
                onChange={(id, items) => onChange('supported_locales', items, setSupportedLocales, map(items, 'id').join(','))}
              />
              <FormTooltip title={configs.supportedLanguages.tooltip} style={{marginLeft: '10px'}} />
            </div> :
          <Button style={{marginTop: '8px'}} size='small' variant='text' onClick={() => setShowSupportedLocales(true)} startIcon={<AddIcon />}>
            Add Supported Language
          </Button>
        }
      </div>
    </div>
  )
}

export default LanguageForm;
