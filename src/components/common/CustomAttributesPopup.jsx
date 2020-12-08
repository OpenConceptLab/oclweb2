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

  const handleRawClose = () => setRaw(false)
  const handleClose = () => setOpen(false)
  const onRawOpen = () => setRaw(true)
  const onOpen = () => setOpen(true)

  return (
    <React.Fragment>
      {
        isEmpty(attributes) ?
        <span>None</span> :
        <span>
          <Chip
            label="Expand"
            onClick={onOpen}
            color="primary"
            variant="outlined"
            size="small"
            deleteIcon={<ArrowRightIcon fontSize="inherit" /> }
            onDelete={onOpen}
            style={{border: 'none'}}
          />
          <Chip
            label="Raw"
            onClick={onRawOpen}
            color="primary"
            variant="outlined"
            size="small"
            deleteIcon={<ArrowRightIcon fontSize="inherit" /> }
            onDelete={onRawOpen}
            style={{marginLeft: '4px', border: 'none'}}
          />
          <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md">
            <DialogTitle>Custom Attributes</DialogTitle>
            <DialogContent>
              <CustomAttributesFormatted attributes={attributes} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog onClose={handleRawClose} open={raw} fullWidth maxWidth="md">
            <DialogTitle>Custom Attributes</DialogTitle>
            <DialogContent>
              <CustomAttributes attributes={attributes} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleRawClose}>
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
