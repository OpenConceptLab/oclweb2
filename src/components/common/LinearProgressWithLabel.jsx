import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import {LinearProgress, Typography, Box} from '@mui/material';

const LinearProgressWithLabel = props => {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const LinearWithValueLabel = ({ progress }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <LinearProgressWithLabel value={progress || 0} />
    </div>
  );
}

export default LinearWithValueLabel;
