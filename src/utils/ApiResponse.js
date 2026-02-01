/**
 * Standardized API response wrapper
 */
class ApiResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      data,
      message,
      timestamp: Date.now(),
    };
  }

  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: Date.now(),
    };
    
    if (errors) {
      response.errors = errors;
    }
    
    return response;
  }

  static validationError(errors) {
    return {
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: Date.now(),
    };
  }
}

module.exports = ApiResponse;
