import { Tooltip } from '@mui/material';
import withStyles from '@mui/styles/withStyles';

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 255,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid rgb(51, 115, 170)',
    left: '-5px',
    display: 'flex',
    alignItems: 'center',
  },
  arrow: {
    color: '#f5f5f9',
    "&::before": {
      border: '1px solid rgb(51, 115, 170)',
    }
  }
}))(Tooltip);

export default HtmlTooltip;
