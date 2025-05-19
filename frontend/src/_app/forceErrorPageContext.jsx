import { createContext, useContext, useMemo, useState } from 'react';

// interface ForceErrorPageContextValue {
//   shouldForceErrorPage: boolean;
//   forceErrorPage: () => void;
// }

const EMPTY_CONTEXT_VALUE = {
  shouldForceErrorPage: false,
  forceErrorPage: () => {
  },
};

const _useForceErrorPageContextValue = () => {
  const [forceErrorPage, setForceErrorPage] = useState(false);

  const contextValue = useMemo(
    () => ({
      shouldForceErrorPage: forceErrorPage,
      forceErrorPage: () => {
        setForceErrorPage(true);
      },
    }),
    [forceErrorPage],
  );

  return contextValue;
};

export const Context = createContext(EMPTY_CONTEXT_VALUE);

// : { children?: ReactNode }
export function ForceErrorPageProvider({ children }) {
  const value = _useForceErrorPageContextValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/**
 * Consumers (components) do not need to access the Context/Provider directly. Instead
 * they should use this helper hook to access 'appData' and 'setAppData'
 */
export function useForceErrorPageContextValue() {
  const context = useContext(Context);
  return context;
}
