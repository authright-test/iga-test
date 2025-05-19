import React, { useState } from 'react';

// initValue: number
export function useTab(initValue) {
  const [currentTab, setCurrentTab] = useState(initValue);

  // event: React.SyntheticEvent, newValue: number
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // higher-order function ( for useEffect )
  // tab: string
  const initCurrentTab = (tab) => () => {
    if (tab && parseInt(tab) !== currentTab) {
      setCurrentTab(parseInt(tab));
    }
  };

  return {
    currentTab,
    setCurrentTab,
    initCurrentTab,
    handleTabChange,
  };
}
