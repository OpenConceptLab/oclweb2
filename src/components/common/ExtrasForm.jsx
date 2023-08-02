import React from 'react';
import { useTranslation } from 'react-i18next';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { TextField, IconButton, Autocomplete } from '@mui/material';
import { get, isObject, isEmpty, find } from 'lodash';
import { jsonifySafe } from '../../common/utils';
import GroupHeader from '../common/GroupHeader';
import GroupItems from '../common/GroupItems';

const ExtrasForm = ({ extra, index, onChange, onDelete, usedExtras }) => {
  const { t } = useTranslation()
  const value = get(extra, 'value', '');

  let _usedExtras = isEmpty(usedExtras) ? [] : usedExtras.sort().map(_extra => ({id: _extra, name: _extra, resultType: 'Suggested'}))

  return (
    <div className='col-xs-12 no-side-padding'>
      <div className='col-xs-12 no-side-padding flex-vertical-center' style={{marginTop: '15px', width: '100%'}}>
        <div className='col-xs-5 no-left-padding'>
          {
            !isEmpty(_usedExtras) ?
              <Autocomplete
                freeSolo
                openOnFocus
                blurOnSelect
                clearOnBlur={false}
                id={`extras.${index}.key`}
                options={_usedExtras}
                getOptionLabel={option => option?.name || option}
                label={t('common.attribute_name')}
                placeholder={t('common.attribute_name_placeholder')}
                variant="outlined"
                fullWidth
                size='small'
                value={extra?.key ? find(_usedExtras, {id: extra.key}) || {id: extra.key, name: extra.key} : null}
                groupBy={option => option.resultType}
                renderGroup={params => (
                  <li style={{listStyle: 'none'}} key={params.group}>
                    <GroupHeader>{params.group}</GroupHeader>
                    <GroupItems>{params.children}</GroupItems>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} size='small' label="Type" variant="outlined" fullWidth />}
                onChange={(event, item) => onChange(index, item?.id || item, '__')}
                onInputChange={(event, value) => onChange(index, value || '', '__')}
              />:
            <TextField
              id={`extras.${index}.key`}
              label={t('common.attribute_name')}
              placeholder={t('common.attribute_name_placeholder')}
              variant="outlined"
              fullWidth
              onChange={event => onChange(index, event.target.value, '__')}
              size='small'
              value={get(extra, 'key', '')}
            />
          }
        </div>
        <div className='col-xs-6 no-side-padding'>
          <TextField
            id={`extras.${index}.value`}
            label={t('common.value')}
            variant="outlined"
            fullWidth
            onChange={event => onChange(index, '__', jsonifySafe(event.target.value))}
            size='small'
            value={isObject(value) ? JSON.stringify(value) : value}
          />
        </div>
        <div className='col-xs-1 no-left-padding' style={{textAlign: 'right', minWidth: '8.33%', width: '8.33%'}}>
          <IconButton onClick={() => onDelete(index)} size="medium">
            <DeleteIcon fontSize='inherit' />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default ExtrasForm;
