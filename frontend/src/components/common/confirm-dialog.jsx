import CloseIcon from '@mui/icons-material/Close';
import { Button, CircularProgress, Dialog, Stack } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useEffect, useState } from 'react';

// export interface ConfirmDialogProps {
//   sx?: SxProps<Theme>;
//   maxWidth?: Breakpoint | false;
//   hideTitle?: boolean;
//   title?: string;
//   isBlocking?: boolean;
//   showCloseButton?: boolean;
//   showCancelButton?: boolean;
//   showOkButton?: boolean;
//   open: boolean;
//   children?: any;
//   onClose?: (value?: any) => void;
//   onAsyncClose?: (value?: any) => Promise<void>;
// }
// props: ConfirmDialogProps
export const ConfirmDialog = (props) => {
  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const {
    sx,
    maxWidth = 'xs',
    showCloseButton = true,
    showCancelButton = true,
    showOkButton = true,
    isBlocking = false,
    title,
    open = false,
    hideTitle = false,
    onClose,
    onAsyncClose,
    children,
    ...others
  } = props;

  const [isConfirming, setIsConfirming] = useState(false);

  const handleCancel = async () => {
    if (onAsyncClose) {
      await onAsyncClose(false);
    } else {
      onClose && onClose(false);
    }
  };

  const handleOk = async () => {
    setIsConfirming(true);
    try {
      if (onAsyncClose) {
        await onAsyncClose(true);
      } else {
        onClose && onClose(true);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setIsConfirming(false); // Reset okDisabled when the dialog is closed
    }
  }, [open]);

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%' }, ...sx }}
      maxWidth={maxWidth}
      open={open}
      onKeyDown={stopPropagation}
      {...others}>
      {!hideTitle && (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} pr={2}>
          <DialogTitle>{title ?? 'Confirm'}</DialogTitle>
          {showCloseButton && <CloseIcon color={'info'} onClick={handleCancel} />}
        </Stack>
      )}
      <DialogContent dividers sx={{ p: 2 }}>
        {children}
      </DialogContent>
      {(showCancelButton || showOkButton) && (
        <DialogActions>
          {showCancelButton && (
            <Button autoFocus onClick={handleCancel} disabled={isConfirming || isBlocking}>
              Cancel
            </Button>
          )}
          {showOkButton && (
            <Button variant='contained' onClick={handleOk} disabled={isConfirming || isBlocking}>
              {isConfirming && <CircularProgress size={'1rem'} sx={{ mr: 1 }} />}
              OK
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};
