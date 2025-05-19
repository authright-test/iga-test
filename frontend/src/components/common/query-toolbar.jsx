import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Badge, IconButton, InputAdornment, Stack, SvgIcon, TextField, Tooltip, Typography, } from '@mui/material';
import { useState } from 'react';

// : {
//   title?: string;
//   badge?: number;
//   placeholder?: string;
//   onSearch?: (_: any) => void;
//   onRefresh?: () => void;
//   customComponent?: any;
//   /**
//    * The system prop, which allows defining system overrides as well as additional CSS styles.
//    */
//   sx?: SxProps<Theme>;
// }
export const QueryToolbar = ({
                               title,
                               badge,
                               placeholder,
                               onSearch,
                               onRefresh,
                               customComponent,
                               sx,
                             }) => {
  const [quickSearchKeyword, setQuickSearchKeyword] = useState('');

  return (
    <Stack
      sx={sx}
      direction={'row'}
      justifyContent={customComponent ? 'space-between' : 'right'}
      alignItems={'center'}>
      {title && (
        <Badge max={9999} badgeContent={badge ?? 0} color='primary'>
          <Typography sx={{ m: 1 }} variant='h5'>
            {title}
          </Typography>
        </Badge>
      )}
      {customComponent}
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        {onSearch && (
          <Tooltip title={'Press enter to search'} placement={'top'}>
            <TextField
              size='small'
              sx={{ width: 300 }}
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
              placeholder={placeholder ?? 'Quick Search...'}
              variant='outlined'
              value={quickSearchKeyword}
              onChange={async (event) => {
                setQuickSearchKeyword(event.target.value.trim());
              }}
              onKeyPress={async (event) => {
                if (event.charCode === 13) {
                  event.preventDefault();
                  onSearch(quickSearchKeyword);
                }
              }}
            />
          </Tooltip>
        )}

        {onRefresh && (
          <IconButton
            color='primary'
            sx={{ borderRadius: '4px' }}
            onClick={async () => {
              onRefresh();
            }}>
            <RefreshOutlinedIcon />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};
