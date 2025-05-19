import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, Stack, SvgIcon, TextField, Tooltip } from '@mui/material';
import { useState } from 'react';

// : {
//   placeholder?: string;
//   disabled?: boolean;
//   showRefreshBg?: boolean;
//   onSearch?: (_: any) => void;
//   onRefresh?: () => void;
//   customComponent?: JSX.Element[] | JSX.Element;
//   /**
//    * The system prop, which allows defining system overrides as well as additional CSS styles.
//    */
//   sx?: SxProps<Theme>;
// }
export const SimpleQueryBar = ({
                                 disabled = false,
                                 placeholder = 'Quick Search...',
                                 showRefreshBg = false,
                                 onSearch,
                                 onRefresh,
                                 customComponent,
                                 sx,
                               }) => {
  const [quickSearchKeyword, setQuickSearchKeyword] = useState('');

  return (
    <Stack
      direction={'row'}
      sx={sx}
      justifyContent={customComponent ? 'space-between' : 'right'}
      alignItems={'center'}>
      {onSearch && (
        <Tooltip title={'Press enter to search'} placement={'top'}>
          <TextField
            size='small'
            sx={{ width: 300 }}
            disabled={disabled}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SvgIcon color='action' fontSize='small'>
                    <SearchIcon />
                  </SvgIcon>
                </InputAdornment>
              ),
              endAdornment: quickSearchKeyword.length > 0 && (
                <InputAdornment
                  position='end'
                  onClick={async () => {
                    setQuickSearchKeyword('');
                    onSearch && onSearch('');
                  }}>
                  <SvgIcon color='action' fontSize='small'>
                    <HighlightOffRoundedIcon />
                  </SvgIcon>
                </InputAdornment>
              ),
            }}
            placeholder={placeholder}
            variant='outlined'
            value={quickSearchKeyword}
            onChange={async (event) => {
              setQuickSearchKeyword(event.target.value.trim());
            }}
            onKeyPress={async (event) => {
              if (event.charCode === 13) {
                event.preventDefault();
                onSearch && onSearch(quickSearchKeyword);
              }
            }}
          />
        </Tooltip>
      )}

      {customComponent}

      {onRefresh && (
        <IconButton
          color='primary'
          sx={{ backgroundColor: showRefreshBg ? 'blue.50' : 'transparent' }}
          disabled={disabled}
          onClick={async () => {
            onRefresh && onRefresh();
          }}>
          <RefreshOutlinedIcon />
        </IconButton>
      )}
    </Stack>
  );
};
