import { errorResponse } from '../utils/response.js';

export const notFound = (req, res, next) => {
  errorResponse(res, 404, `Not Found - ${req.originalUrl}`, 'NOT_FOUND');
};
