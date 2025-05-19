import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

// type DrawerSize = 'auto' | 'half' | 'full';

// : {
//   size?: DrawerSize;
//   position?: 'left' | 'top' | 'right' | 'bottom';
//   title?: string;
//   showTitle?: boolean;
//   open: boolean;
//   showCloseButton?: boolean;
//   children?: React.ReactNode;
//   disableEscapeKeyDown?: boolean;
//   sx?: SxProps<Theme>;
//   onClose: (flag: boolean) => void;
// }
export const DrawerLayout = ({
                               size = 'auto',
                               position = 'right',
                               title = 'Detail',
                               showTitle = true,
                               showCloseButton = true,
                               open,
                               children,
                               sx,
                               onClose,
                               disableEscapeKeyDown = true,
                             }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' ||
        event.key === 'Shift')
    ) {
      return;
    }
    onClose(open);
  };

  let width = '100vw';
  let height = '100vh';

  if (position === 'top' || position === 'bottom') {
    height = `calc(100vh - 80px)`;
    if (size === 'half') {
      height = '50vh';
    }
    if (size === 'full') {
      height = '100vh';
    }
  } else {
    width = mdUp ? '700px' : '100vw';
    if (size === 'half' && mdUp) {
      width = '50vw';
    }
    if (size === 'full') {
      width = '100vw';
    }
  }

  return (
    <Drawer
      sx={{ ...sx }}
      anchor={position}
      open={open}
      disableEscapeKeyDown={disableEscapeKeyDown}
      onClose={toggleDrawer(false)}>
      <Stack direction='column' sx={{ width, height }}>
        {showCloseButton && mdUp && (
          <IconButton
            sx={{
              position: 'absolute',
              right: '10px',
              top: position === 'left' || position === 'right' ? '90px' : '10px',
            }}
            size='small'
            onClick={() => onClose(true)}>
            <CloseIcon />
          </IconButton>
        )}
        {(position === 'left' || position === 'right') && <Stack sx={{ height: 80 }}></Stack>}
        {showTitle &&
          (mdUp ? (
            <Stack
              direction={'row'}
              justifyContent={'center'}
              alignItems={'center'}
              sx={{
                height: 80,
                border: '1px solid rgba(239, 239, 239, 1)',
              }}>
              <Typography sx={{ color: grey[700], fontSize: '18px', fontWeight: '800' }}>
                {title}
              </Typography>
            </Stack>
          ) : (
            <Stack
              direction={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              sx={{ height: 80, border: '1px solid rgba(239, 239, 239, 1)' }}
              p={2}>
              <Typography sx={{ color: grey[700], fontSize: '18px', fontWeight: '800' }}>
                {title}
              </Typography>
              <IconButton onClick={() => onClose(true)}>
                <HighlightOffIcon fontSize={'medium'} />
              </IconButton>
            </Stack>
          ))}
        <Stack sx={{ flex: 1, overflow: 'auto' }}>{children}</Stack>
      </Stack>
    </Drawer>
  );
};
