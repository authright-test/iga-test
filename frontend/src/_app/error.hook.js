import { toast } from 'react-toastify';
import { DatadogLogger } from './logging';
import { extractErrorDetails } from './error-utils';
import { useForceErrorPageContextValue } from './forceErrorPageContext';

export const useHandleError = () => {
  const { forceErrorPage } = useForceErrorPageContextValue();

  const handleError = (error) => {
    const { message } = error;
    if (!!message) {
      toast.error(message);
      DatadogLogger.logError(JSON.stringify(error));
      return;
    }

    if (error.stack) {
      DatadogLogger.logError(JSON.stringify(extractErrorDetails(error)));
      return forceErrorPage();
    } else {
      DatadogLogger.logError(JSON.stringify(error));
      return forceErrorPage();
    }
  };

  return { handleError };
};
