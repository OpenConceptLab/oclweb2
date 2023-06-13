import React from 'react';
import { useTranslation, Trans } from 'react-i18next'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { last } from 'lodash';
import { RED } from '../../common/constants';

const ConceptContainerDelete = ({open, resource, onClose, onDelete, associatedResources, associationRelation, summaryContent}) => {
  const { t } = useTranslation()
  const resourceEntity = resource.type
  const resourceType = resourceEntity.toLowerCase()
  const resourceId = resource.short_code || resource.id
  const [input, setInput] = React.useState('');
  const canDelete = input === resourceId
  const opacity = canDelete ? 1 : 0.5;
  const onSubmit = () => {
    onClose();
    onDelete();
  }
  const associations = (associatedResources || ['versions', 'concepts', 'mappings'])
  let associationsLabel = associations.slice(0, -1).join(', ') + ' and ' + last(associations)
  const relationship = associationRelation || t('common.associated')
  return (
    <React.Fragment>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          {`${t('common.delete')} ${resourceEntity}: ${resourceId}`}
        </DialogTitle>
        <DialogContent>
          <MuiAlert variant="filled" severity="warning" style={{marginBottom: '10px'}}>
            {t('concept_container.delete.generic_error')}
          </MuiAlert>
          <p>
            {t('concept_container.delete.confirmation_title', {resourceType: resourceType})} <b>{resourceId}</b>?
          </p>
          { summaryContent || '' }
          <p>
            <Trans key='concept_container.delete.message'>
              This action <strong>cannot</strong> be undone!. This will delete the entire {{resourceType}} and all of its {{relationship}} {{associationsLabel}} (if any).
            </Trans>
          </p>
          <p>
            <Trans i18nKey="concept_container.delete.confirmation_message">
              Please type <strong>{{resourceId}}</strong> to confirm.
            </Trans>
          </p>
          <div className='col-md-12 no-side-padding'>
            <TextField
              fullWidth
              variant='outlined' size="small" onChange={event => setInput(event.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions style={{textAlign: 'center', justifyContent: 'center', margin: '15px 0'}}>
          <Button
            disabled={!canDelete}
            style={{color: RED, fontWeight: 'bold', opacity: opacity}}
            variant='outlined'
            onClick={onSubmit}>
            {t('concept_container.delete.confirmation_button_label', {resourceType: resourceType})}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default ConceptContainerDelete;
