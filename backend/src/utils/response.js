/**
 * Standardize API responses
 */
export const successResponse = (res, statusCode, data = {}, pagination = null) => {
  const response = {
    success: true,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, code = 'ERROR', errors = null) => {
  const response = {
    success: false,
    message,
    code,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
