import { Tooltip } from '@mui/material';
import withStyles from '@mui/styles/withStyles';

const HtmlToolTipRaw = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#FFF',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 255,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid rgba(0, 0, 0, 0.25)',
    left: '-5px',
    display: 'flex',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFF',
    "&::before": {
      border: '1px solid rgb(0, 0, 0, 0.25)',
    }
  }
}))(Tooltip);

export default HtmlToolTipRaw;

export const HtmlToolTipNormalRaw = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#FFF',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid rgba(0, 0, 0, 0.25)',
    left: '-5px',
    display: 'flex',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFF',
    "&::before": {
      border: '1px solid rgb(0, 0, 0, 0.25)',
    }
  }
}))(Tooltip);
