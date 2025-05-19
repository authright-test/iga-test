export const extractErrorDetails = (error) => {
  return { message: error?.message, stack: error?.stack };
};
