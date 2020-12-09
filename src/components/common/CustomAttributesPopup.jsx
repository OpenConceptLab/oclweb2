import React from 'react';
import {
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { isEmpty } from 'lodash';
import CustomAttributes from './CustomAttributes'
import CustomAttributesFormatted from './CustomAttributesFormatted'

const CustomAttributesPopup = ({attributes}) => {
  const [raw, setRaw] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false)
  const onOpen = () => setOpen(true)

  return (
    <React.Fragment>
      {
        isEmpty(attributes) ?
        <span>None</span> :
        <span>
          <Chip
            label="Show"
            onClick={onOpen}
            color="primary"
            variant="outlined"
            size="small"
            deleteIcon={<ArrowRightIcon fontSize="inherit" /> }
            onDelete={onOpen}
            style={{border: 'none'}}
          />
          <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md">
            <DialogTitle>Custom Attributes</DialogTitle>
            <DialogContent>
              {
                raw ?
                <CustomAttributes attributes={attributes} /> :
                <CustomAttributesFormatted attributes={attributes} />
              }
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setRaw(!raw) }>
                { raw ? 'Formatted' : 'Raw' }
              </Button>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </span>
      }
    </React.Fragment>
  )
}

export default CustomAttributesPopup;
