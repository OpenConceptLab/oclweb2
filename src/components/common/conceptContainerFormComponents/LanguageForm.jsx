import React from 'react';
import {
  Button
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { fetchLocales } from '../../../common/utils';
import { get, map, find, filter, includes, forEach, compact, flatten, uniqBy, without, uniq } from 'lodash';
import FormTooltip from '../FormTooltip';
import LocaleAutoComplete from '../LocaleAutoComplete'

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
            __locales.push({id: _locale, name: _locale})
        })
      }
      setLocales(__locales)
      if(props.edit) {
        setDefaultLocale(compact([find(__locales, {id: props.repo.default_locale})]))
        if(props.repo.supported_locales) {
          setShowSupportedLocales(true)
          const _supportedLocales = without(props.repo.supported_locales, props.repo.default_locale)
          setSupportedLocales(uniqBy(filter(__locales, _locale => includes(_supportedLocales, _locale.id)), 'id'))
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
      {
        configs.subTitle &&
          <div className='col-xs-12 no-side-padding' style={{marginBottom: '15px'}}>
            <div className='col-xs-12 no-side-padding form-text-gray'>
              {configs.subTitle}
            </div>
          </div>
      }
      <div className='col-xs-12 no-side-padding flex-vertical-center'>
        <LocaleAutoComplete
          cachedLocales={locales}
          label={configs.defaultLanguage.label}
          placeholder={configs.defaultLanguage.placeholder}
          size='small'
          required
          value={compact(defaultLocale)}
          onChange={(id, items) => onChange('default_locale', items, setDefaultLocale, map(items, 'id').join(','))}
          custom
          multiple
          limit={1}
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
                placeholder={configs.supportedLanguages.placeholder}
                size='small'
                value={compact(supportedLocales)}
                onChange={(id, items) => onChange('supported_locales', items, setSupportedLocales, uniq(map(items, 'id')).join(','))}
                custom
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
