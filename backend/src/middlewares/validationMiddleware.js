import { errorResponse } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return errorResponse(res, 422, 'Validation failed', 'VALIDATION_ERROR', errors);
    }

    // Replace req object with validated value (handles defaults)
    req[source] = value;
    next();
  };
};
