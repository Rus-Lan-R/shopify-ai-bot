export const promiseRetry = async <T>(
  asyncMethod: () => Promise<T>,
  condition: (result: T) => boolean,
  interval: number = 1 * 1000,
  timeout: number = 60 * 1000
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const startTime = Date.now();

    const retry = async () => {
      try {
        const result = await asyncMethod();

        if (condition(result)) {
          return resolve(result);
        }

        if (Date.now() - startTime >= timeout) {
          return reject(
            new Error("Timeout exceeded while waiting for a valid response.")
          );
        }

        setTimeout(retry, interval);
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          return reject(new Error(`Timeout exceeded with error: ${error}`));
        }

        setTimeout(retry, interval);
      }
    };

    retry();
  });
};
