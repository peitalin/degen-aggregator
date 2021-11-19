let _requiredVariables: string[] = [];

// Declares which variables are expected to be in the environment
export const setRequiredEnvironmentVariables = (variables: string[]) => {
  _requiredVariables = variables;
};

// Checks process.env for presence of values for each input variable, throwing an error if not configured.
export const checkEnv = (noError: boolean = false): boolean => {
  // Check that all of the values are present
  let missingValues: string[] = [];
  _requiredVariables.forEach(key => {
    const value = process.env[key];
    if (!value) {
      missingValues.push(key);
    }
  });

  // Throw error if applicable
  const isAllGood = missingValues.length === 0;
  if (!isAllGood && !noError) {
    throw new Error(`Missing environment variables: ${missingValues}`);
  }
  return isAllGood;
};
