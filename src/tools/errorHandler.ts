/**
 * Helper function to handle API errors and provide user-friendly messages
 */
export function handleTaskError(error: any, defaultMessage: string): string {
  // Handle case where error might not have expected structure
  if (!error) {
    return defaultMessage;
  }

  // Check for 404 Not Found
  if (error.response && error.response.status === 404) {
    return 'La tarea no existe en la base de datos';
  }
  
  // Check for 400 Bad Request
  if (error.response && error.response.status === 400) {
    const message = error.response.data?.message;
    if (message) {
      // Translate common API error messages
      if (message.includes('Cannot complete task while subtasks are not completed')) {
        return 'No se puede completar la tarea mientras tenga subtareas incompletas. Las subtareas deben completarse primero.';
      }
      return message;
    }
    return 'Solicitud inválida';
  }
  
  // Check for other HTTP errors
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  // Generic error
  if (error.message) {
    return error.message;
  }
  
  // Last resort
  return defaultMessage;
}

