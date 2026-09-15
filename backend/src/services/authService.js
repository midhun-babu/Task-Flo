import { findUserByEmail, createUser } from '../dbqueries/userQueries.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

export const register = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    const error = new Error('Email already registered');
    error.code = 'EMAIL_EXISTS';
    throw error;
  }

  const hashedPassword = await hashPassword(userData.password);
  
  const user = await createUser({
    ...userData,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Strip password from returned user object
  user.password = undefined;

  return { user, accessToken, refreshToken };
};

export const login = async (email, password) => {
  const user = await findUserByEmail(email, true);
  
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.password = undefined;

  return { user, accessToken, refreshToken };
};
