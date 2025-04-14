/**
 * Safely parses JSON from a response, with error handling
 * @param response The fetch response object
 * @param errorPrefix Optional prefix for error messages
 * @returns The parsed JSON data or null if parsing fails
 */
export async function safelyParseJson(response: Response, errorPrefix: string = ''): Promise<any | null> {
  try {
    // Check if the response is OK
    if (!response.ok) {
      console.error(`${errorPrefix} HTTP error ${response.status}: ${response.statusText}`);
      return null;
    }
    
    // Check if the content type is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`${errorPrefix} Expected JSON but got ${contentType}`);
      return null;
    }
    
    // Parse the JSON
    return await response.json();
  } catch (error) {
    console.error(`${errorPrefix} ${error}`);
    return null;
  }
}

/**
 * Handles API errors and returns a user-friendly message
 * @param error The error object
 * @param defaultMessage Default message to show if no specific error is found
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An unexpected error occurred'): string {
  if (!error) {
    return defaultMessage;
  }
  
  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }
  
  return defaultMessage;
}

/**
 * Creates a standard API response object
 * @param success Whether the operation was successful
 * @param data Optional data to include in the response
 * @param message Optional message to include in the response
 * @param error Optional error to include in the response
 * @returns A standardized API response object
 */
export function createApiResponse(
  success: boolean, 
  data?: any, 
  message?: string, 
  error?: any
): { success: boolean; data?: any; message?: string; error?: any } {
  const response: { success: boolean; data?: any; message?: string; error?: any } = { success };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  if (error) {
    response.error = error;
  }
  
  return response;
}/**
 * Safely parses JSON from a response, with error handling
 * @param response The fetch response object
 * @param errorPrefix Optional prefix for error messages
 * @returns The parsed JSON data or null if parsing fails
 */
export async function safelyParseJson(response: Response, errorPrefix: string = ''): Promise<any | null> {
  try {
    // Check if the response is OK
    if (!response.ok) {
      console.error(`${errorPrefix} HTTP error ${response.status}: ${response.statusText}`);
      return null;
    }
    
    // Check if the content type is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`${errorPrefix} Expected JSON but got ${contentType}`);
      return null;
    }
    
    // Parse the JSON
    return await response.json();
  } catch (error) {
    console.error(`${errorPrefix} ${error}`);
    return null;
  }
}

/**
 * Handles API errors and returns a user-friendly message
 * @param error The error object
 * @param defaultMessage Default message to show if no specific error is found
 * @returns A user-friendly error message
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An unexpected error occurred'): string {
  if (!error) {
    return defaultMessage;
  }
  
  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }
  
  return defaultMessage;
}

/**
 * Creates a standard API response object
 * @param success Whether the operation was successful
 * @param data Optional data to include in the response
 * @param message Optional message to include in the response
 * @param error Optional error to include in the response
 * @returns A standardized API response object
 */
export function createApiResponse(
  success: boolean, 
  data?: any, 
  message?: string, 
  error?: any
): { success: boolean; data?: any; message?: string; error?: any } {
  const response: { success: boolean; data?: any; message?: string; error?: any } = { success };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  if (error) {
    response.error = error;
  }
  
  return response;
}