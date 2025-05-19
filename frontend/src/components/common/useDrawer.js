import { useState } from 'react';

export const useDrawer = () => {
  const [drawerState, setDrawerState] = useState(false);
  const [request, setRequest] = useState({});

  const openDrawer = async (request = {}) => {
    setRequest(request);
    setDrawerState(true);
  };

  const closeDrawer = async () => {
    setDrawerState(false);
  };

  return {
    drawerState,
    request,
    openDrawer,
    closeDrawer,
  };
};
