import TaskInstance from '../models/TaskInstance.js';

export const createTaskInstance = async (instanceData) => {
  const instance = new TaskInstance(instanceData);
  return instance.save();
};

export const findTaskInstances = async (filter, sort, skip, limit) => {
  return TaskInstance.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'name email');
};

export const updateTaskInstance = async (id, updateData) => {
  return TaskInstance.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};
