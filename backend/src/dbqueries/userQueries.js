import User from '../models/User.js';

export const findUserByEmail = async (email, includePassword = false) => {
  const query = User.findOne({ email });
  if (includePassword) {
    query.select('+password');
  }
  return query.exec();
};

export const findUserById = async (id, includePassword = false) => {
  const query = User.findById(id);
  if (includePassword) {
    query.select('+password');
  }
  return query.exec();
};

export const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

export const updateUser = async (id, updateData) => {
  return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
