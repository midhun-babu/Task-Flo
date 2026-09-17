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

    // req.query is read-only in Express 5, so store validated query separately
    if (source === 'query') {
      req.validatedQuery = value;
    } else {
      req[source] = value;
    }
    next();
  };
};
