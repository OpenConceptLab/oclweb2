import React from 'react';
import { startCase, map } from 'lodash';
import { Button } from '@material-ui/core';
import {
  Add as AddIcon,
} from '@material-ui/icons'

const NewResourceButton = ({resources, onClick}) => {
  return (
    <React.Fragment>
      {
        map(resources, resource => (
          <Button
            key={resource}
            style={{marginRight: '5px'}}
            size="small"
            color="primary"
            variant="outlined"
            startIcon={<AddIcon fontSize="inherit"/>}
            onClick={() => onClick(resource)}>
            {startCase(resource)}
          </Button>
        ))
      }
    </React.Fragment>
  )
}

export default NewResourceButton;
