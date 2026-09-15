import Task from '../models/Task.js';

export const createTask = async (taskData) => {
  const task = new Task(taskData);
  return task.save();
};

export const findTaskById = async (id) => {
  return Task.findById(id).populate('assignedTo', 'name email').populate('createdBy', 'name email');
};

export const findTasks = async (filter, sort, skip, limit) => {
  return Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
};

export const countTasks = async (filter) => {
  return Task.countDocuments(filter);
};

export const updateTask = async (id, updateData) => {
  return Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
};

export const updateTaskStatus = async (id, status, completionDate = null) => {
  const update = { status };
  if (completionDate) {
    update.completionDate = completionDate;
  }
  return Task.findByIdAndUpdate(id, update, { new: true });
};

export const cancelTask = async (id) => {
  return Task.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
};
