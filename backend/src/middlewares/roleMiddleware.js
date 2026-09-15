import { errorResponse } from '../utils/response.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        'User role is not authorized to perform this action',
        'FORBIDDEN'
      );
    }
    next();
  };
};
