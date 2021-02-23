import React from 'react';
import { Button } from '@material-ui/core';
import {
  CompareArrows as CompareArrowsIcon,
  GetApp as DownloadIcon,
  Repeat as RepeatIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { map, includes, get } from 'lodash';
import { currentUserHasAccess, isLoggedIn } from '../../common/utils'
import DownloadButton from '../common/DownloadButton';
import AddToCollection from '../common/AddToCollection';

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
  const shouldShowCompareOption = isConceptResource && selectedItems.length === 2;
  const shouldShowCreateSimilarOption = isSourceChild && hasAccess && selectedItems.length == 1 && onCreateSimilarClick;
  const shouldShowAddToCollection = isSourceChild && isAuthenticated && hasSelectedItems;
  const shouldShowCreateMappingOption = isConceptResource && hasAccess && hasSelectedItems && selectedItems.length <= 2 && onCreateMappingClick;
  const shouldShowDeleteReferenceOption = (isReferenceResource || isSourceChild) && onReferencesDelete && hasAccess && hasSelectedItems;

  const onReferenceDeleteClick = event => {
    event.stopPropagation()
    event.preventDefault()
    onReferencesDelete(
      isSourceChild ? map(selectedItems, 'version_url') : map(selectedItems, 'expression')
    )
  }

  const onCompareClick = event => {
    event.stopPropagation()
    event.preventDefault()
    const urls = map(selectedItems, 'url')
    if(urls.length == 2) {
      const url = `#/concepts/compare?lhs=${urls[0]}&rhs=${urls[1]}`
      window.open(url, '_blank')
    }
  }

  return (
    <span>
      {
        shouldShowDownloadOption &&
        <DownloadButton
          includeCSV
          formats={['json']}
          resource={selectedItems}
          buttonFunc={
            attrs =>
              <Button startIcon={<DownloadIcon fontSize='small' />} variant='contained' size='small' color='secondary' {...attrs}>
                Download
              </Button>
          }
          queryParams={{verbose: true, includeInverseMappings: true, includeSummary: true }}
        />
      }
      {
        shouldShowCreateSimilarOption &&
        <Button
          startIcon={<RepeatIcon fontSize='small' />}
          variant='contained'
          size='small'
          color='secondary'
          onClick={() => onCreateSimilarClick(get(selectedItems, '0'))}
          style={{marginLeft: '10px'}}
          >
          Create Similar
        </Button>
      }
      {
        shouldShowCreateMappingOption &&
        <Button
          startIcon={<LinkIcon fontSize='small' />}
          variant='contained'
          size='small'
          color='secondary'
          onClick={() => onCreateMappingClick(selectedItems)}
          style={{marginLeft: '10px'}}
          >
          Create Mapping
        </Button>
      }
      {
        shouldShowAddToCollection &&
        <span style={{marginLeft: '10px'}}>
          <AddToCollection
            variant='contained' color='secondary' size='small' references={selectedItems}
          />
        </span>
      }
      {
        shouldShowCompareOption &&
        <Button
          startIcon={<CompareArrowsIcon fontSize='small' />}
          variant='contained'
          size='small'
          color='secondary'
          onClick={onCompareClick}
          style={{marginLeft: '10px'}}
          >
          Compare
        </Button>
      }
      {
        shouldShowDeleteReferenceOption &&
        <Button
          startIcon={<DeleteIcon fontSize='small' />}
          variant='contained'
          size='small'
          color='secondary'
          onClick={onReferenceDeleteClick}
          style={{marginLeft: '10px'}}
          >
          Delete
        </Button>
      }
      { extraControls }
    </span>
  )
}

export default SelectedResourceControls;
