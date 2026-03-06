/**
 * UUID validation utilities
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate if a string is a valid UUID
 * @param id - String to validate
 * @returns True if valid UUID, false otherwise
 */
export const isValidUUID = (id: string): boolean => {
  return UUID_REGEX.test(id);
};

/**
 * Validate UUID and throw error if invalid
 * @param id - String to validate
 * @param paramName - Name of parameter for error message
 * @throws Error if invalid UUID
 */
export const validateUUID = (id: string, paramName: string = 'ID'): void => {
  if (!isValidUUID(id)) {
    throw new Error(`Invalid ${paramName}: must be a valid UUID`);
  }
};
