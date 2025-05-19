import { useState } from 'react';

export const useDialog = () => {
  const [dialogState, setDialogState] = useState(false);
  const [value, setValue] = useState({});

  const openDialog = async (v = {}) => {
    setDialogState(true);
    setValue(v);
  };

  const closeDialog = async () => {
    setDialogState(false);
  };

  return {
    dialogState,
    value,
    openDialog,
    closeDialog,
  };
};
