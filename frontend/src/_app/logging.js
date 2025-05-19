export const DatadogLogger = {
  logError: (message, context) => {
    // TODO: use datadog sdk when needed
    console.log(message, context);
  }
}
