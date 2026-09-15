import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route', 'UNAUTHORIZED');
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Token is invalid or expired', 'INVALID_TOKEN');
  }
};
