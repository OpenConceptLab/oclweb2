import { styled } from '@mui/system';

const GroupHeader = styled('div')({
  position: 'sticky',
  top: '-8px',
  padding: '4px 16px',
  zIndex: 1000,
  backgroundColor: '#f5f5f5',
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.6)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
});


export default GroupHeader;
