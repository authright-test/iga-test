import RefreshIcon from '@mui/icons-material/Refresh';
import { ButtonProps, IconButton, Tooltip } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';

export const StyledIconButton = styled(IconButton)(() => ({
  borderRadius: '8px',
  border: '1px solid ',
  borderColor: grey[300],
  boxSizing: 'border-box',
  backgroundColor: 'white',
  height: '1.65em',
  width: '1.65em',
}));

// : { onRefresh?: () => void }
export const QuickRefresh = ({ onRefresh }) => {
  return (
    <Tooltip title='Refresh'>
      <StyledIconButton onClick={onRefresh} size={'medium'}>
        <RefreshIcon fontSize={'small'} />
      </StyledIconButton>
    </Tooltip>
  );
};
