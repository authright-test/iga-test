import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Alert, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';

//: {
//   children: React.ReactNode;
//   disabled?: boolean;
//   extension?: React.ReactNode;
//   onRefresh: () => void;
//   sx?: SxProps<Theme>;
// }
export const SearchCriteriaBar = ({
                                    children,
                                    disabled,
                                    extension,
                                    onRefresh,
                                    sx,
                                  }) => {
  return (
    <Alert
      icon={false}
      severity={'info'}
      sx={{
        backgroundColor: 'grey.100',
        borderEndEndRadius: 0,
        borderEndStartRadius: 0,
        '& .MuiAlert-message': {
          width: '100%',
        },
        ...sx,
      }}>
      <Stack
        direction={'row'}
        justifyContent={'space-between'}
        gap={2}
        width={'100%'}
        alignItems={'center'}>
        <Stack direction={'row'} gap={2} flexWrap={'wrap'} alignItems={'center'} flex={1}>
          {children}
        </Stack>
        <Stack direction={'row'} gap={2} alignItems={'center'}>
          {extension}
          {onRefresh && (
            <IconButton color='primary' disabled={disabled} onClick={onRefresh}>
              <RefreshOutlinedIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </Alert>
  );
};

//: { label: string; value?: any }
export const SearchCriteriaItem = ({ label, value }) => {
  if (value == null || value == undefined) {
    return <></>;
  }

  return (
    <Stack direction={'row'} spacing={1}>
      <Typography variant={'body1'}>{label}:</Typography>
      <Typography variant={'body1'} sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
};
