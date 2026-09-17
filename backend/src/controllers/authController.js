import { register, login } from '../services/authService.js';
import { findUserById } from '../dbqueries/userQueries.js';
import { successResponse } from '../utils/response.js';

export const registerUser = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await register(req.body);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, 201, { user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await login(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, 200, { user, accessToken });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    
    return successResponse(res, 200, { message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is the JWT payload { id, role } — fetch the full user record from DB
    const user = await findUserById(req.user.id);
    if (!user) {
      return next(Object.assign(new Error('User not found'), { code: 'USER_NOT_FOUND' }));
    }
    return successResponse(res, 200, { user });
  } catch (error) {
    next(error);
  }
};
