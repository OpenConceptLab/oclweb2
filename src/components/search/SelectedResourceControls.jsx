import React from 'react';
import { Chip } from '@mui/material';
import {
  CompareArrows as CompareArrowsIcon,
  GetApp as DownloadIcon,
  Repeat as RepeatIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  AutoAwesome as BetaIcon,
} from '@mui/icons-material';
import { map, includes, get } from 'lodash';
import { currentUserHasAccess, isLoggedIn } from '../../common/utils'
import DownloadButton from '../common/DownloadButton';
import AddToCollection from '../common/AddToCollection';
import CloneToSource from '../common/CloneToSource';

const SelectedResourceControls = ({
  selectedItems, resource, onCreateSimilarClick, onCreateMappingClick, onReferencesDelete, extraControls
}) => {
  const hasAccess = currentUserHasAccess()
  const isAuthenticated = isLoggedIn();
  const isReferenceResource = resource === 'references';
  const isConceptResource = resource === 'concepts';
  const isSourceChild = includes(['concepts', 'mappings'], resource);
  const hasSelectedItems = selectedItems.length > 0;
  const shouldShowDownloadOption = isSourceChild && hasSelectedItems;
  const shouldShowCompareOption = isSourceChild && selectedItems.length === 2;
  const shouldShowCreateSimilarOption = isSourceChild && hasAccess && selectedItems.length == 1 && onCreateSimilarClick;
  const shouldShowAddToCollection = isSourceChild && isAuthenticated && hasSelectedItems;
  const shouldShowCreateMappingOption = isConceptResource && hasAccess && hasSelectedItems && selectedItems.length <= 2 && onCreateMappingClick;
  const shouldShowDeleteReferenceOption = (isReferenceResource || isSourceChild) && onReferencesDelete && hasAccess && hasSelectedItems;

  const onReferenceDeleteClick = event => {
    event.stopPropagation()
    event.preventDefault()
    onReferencesDelete(selectedItems)
  }

  const onCompareClick = event => {
    event.stopPropagation()
    event.preventDefault()
    const urls = map(selectedItems, 'url')
    if(urls.length == 2) {
      const url = `#/${resource}/compare?lhs=${urls[0]}&rhs=${urls[1]}`
      window.open(url, '_blank')
    }
  }

  const COLOR = 'secondary'
  const VARIANT = 'filled'
  const buttonProps = {variant: VARIANT, color: COLOR, size: 'small'}
  const MARGIN = '4px'

  const getRemoveRefIcon = () => isSourceChild ? <BetaIcon fontSize='small' /> : <DeleteIcon fontSize='small' />;

  return (
    <span style={{display: 'inline-flex', width: 'max-content'}}>
      {
        shouldShowDownloadOption &&
          <span>
            <DownloadButton
              includeCSV
              formats={['json']}
              resource={selectedItems}
              buttonFunc={
                attrs =>
                <Chip icon={<DownloadIcon fontSize='small' />} {...buttonProps} {...attrs} className='selected-control-chip' label='Download' />
              }
              queryParams={{verbose: true, includeInverseMappings: true, includeSummary: true }}
            />
          </span>
      }
      {
        shouldShowCreateSimilarOption &&
        <Chip
          icon={<RepeatIcon fontSize='small' />}
          onClick={() => onCreateSimilarClick(get(selectedItems, '0'))}
          style={{marginLeft: MARGIN}}
          className='selected-control-chip'
          {...buttonProps}
          label='Create Similar'
        />
      }
      {
        shouldShowCreateMappingOption &&
        <Chip
          icon={<LinkIcon fontSize='small' />}
          onClick={() => onCreateMappingClick(selectedItems)}
          style={{marginLeft: MARGIN}}
          className='selected-control-chip'
          {...buttonProps}
          label='Create Mapping'
        />
      }
      {
        shouldShowAddToCollection &&
        <span style={{marginLeft: MARGIN}}>
          <AddToCollection {...buttonProps} references={selectedItems} />
        </span>
      }
      {
        shouldShowAddToCollection && isConceptResource &&
          <span style={{marginLeft: MARGIN}}>
            <CloneToSource {...buttonProps} references={selectedItems} />
          </span>
      }
      {
        shouldShowCompareOption &&
        <Chip
          icon={<CompareArrowsIcon fontSize='small' />}
          onClick={onCompareClick}
          style={{marginLeft: MARGIN}}
          className='selected-control-chip'
          {...buttonProps}
          label='Compare'
        />
      }
      {
        shouldShowDeleteReferenceOption &&
        <Chip
          icon={getRemoveRefIcon()}
          onClick={onReferenceDeleteClick}
          style={{marginLeft: MARGIN}}
          className='selected-control-chip'
          {...buttonProps}
          label='Remove Reference'
        />
      }
      { extraControls }
    </span>
  )
}

export default SelectedResourceControls;
