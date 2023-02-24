import React from 'react';
import {
  Dialog, DialogContent, DialogTitle,
  DialogActions, Button, Slide, IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material'
import { get } from 'lodash';
import ConceptHierarchyTree from './ConceptHierarchyTree';
import HierarchyTreeFilters from './HierarchyTreeFilters';
import ResourceTextBreadcrumbs from '../common/ResourceTextBreadcrumbs';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConceptCascadeVisualizeDialog = ({concept, open, onClose, filters, onFilterChange, onCascadeFilterChange, source, sourceVersion, hierarchyMeaning, parent, treeData, noBreadcrumbs}) => {
  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <DialogTitle>
        <div className='col-xs-12 no-side-padding'>
          <div className='col-xs-11 no-side-padding'>
            {
              !noBreadcrumbs &&
                <ResourceTextBreadcrumbs resource={concept} includeSelf style={{marginLeft: '-15px', marginBottom: '10px'}} />
            }
            <div className='col-xs-12 no-side-padding'>
              <span>Associations</span>
              {
                filters !== false &&
                  <span style={{marginLeft: '20px'}}>
                    <HierarchyTreeFilters
                      filters={filters}
                      onChange={onCascadeFilterChange}
                      onFilterChange={onFilterChange}
                      size='medium'
                    />
                  </span>
              }
            </div>
          </div>
          <div className='col-xs-1 no-side-padding'>
            <span style={{float: 'right'}}>
              <IconButton
                edge="end"
                color="inherit"
                onClick={onClose}
              >
                <CloseIcon />
              </IconButton>
            </span>
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className='col-xs-12' style={{padding: '10px'}}>
          <ConceptHierarchyTree concept={concept} fontSize='14' dx={80} hierarchyMeaning={hierarchyMeaning} filters={filters} sourceVersion={sourceVersion} source={source} parent={parent} reverse={get(filters, 'reverse', false)} treeData={treeData} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConceptCascadeVisualizeDialog;
