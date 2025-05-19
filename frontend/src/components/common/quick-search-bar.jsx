import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, SvgIcon, TextField, Tooltip } from '@mui/material';
import React, { useState } from 'react';

// : {
//   width?: number | string;
//   placeholder?: string;
//   helpText?: string;
//   onSearch?: (onSearch: string) => void;
// }
export const QuickSearchBar = ({
                                 width = 200,
                                 placeholder = 'Quick Search...',
                                 helpText,
                                 onSearch,
                               }) => {
  const [quickSearchKeyword, setQuickSearchKeyword] = useState('');

  return (
    <Tooltip title={helpText} placement={'top'}>
      <TextField
        size='small'
        sx={{
          backgroundColor: 'white',
          width,
        }}
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
          if (event.key === 'enter') {
            event.preventDefault();
            onSearch && onSearch(quickSearchKeyword);
          }
        }}
      />
    </Tooltip>
  );
};
