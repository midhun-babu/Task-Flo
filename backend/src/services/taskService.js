import { findTaskById, findTasks, createTask, updateTask, updateTaskStatus, cancelTask, countTasks } from '../dbqueries/taskQueries.js';
import { findUserById } from '../dbqueries/userQueries.js';

export const getTasks = async (user, queryData) => {
  const filter = {};

  // Object-level authorization
  if (user.role === 'employee') {
    filter.assignedTo = user.id;
  } else if (user.role === 'manager') {
    // Only tasks created by this manager, or assigned to this manager, unless an explicit logic allows viewing all
    // To simplify: a manager can see tasks they created.
    filter.createdBy = user.id;
  }

  // Apply filters
  if (queryData.status) filter.status = queryData.status;
  if (queryData.priority) filter.priority = queryData.priority;
  
  // Do not let employees override assignedTo filter
  if (queryData.assignedTo && user.role !== 'employee') {
    filter.assignedTo = queryData.assignedTo;
  }
  
  if (queryData.scheduleType) filter.scheduleType = queryData.scheduleType;
  if (queryData.search) {
    filter.$or = [
      { title: { $regex: queryData.search, $options: 'i' } },
      { description: { $regex: queryData.search, $options: 'i' } }
    ];
  }

  // Pagination
  const page = parseInt(queryData.page, 10);
  const limit = parseInt(queryData.limit, 10);
  const skip = (page - 1) * limit;

  // Sorting
  const sort = { [queryData.sortBy]: queryData.order === 'asc' ? 1 : -1 };

  const tasks = await findTasks(filter, sort, skip, limit);
  const total = await countTasks(filter);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  };
};

export const getTaskById = async (taskId, user) => {
  const task = await findTaskById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  // Object-level authorization
  if (user.role === 'employee' && task.assignedTo._id.toString() !== user.id) {
    const error = new Error('Not authorized to view this task');
    error.code = 'FORBIDDEN';
    throw error;
  }
  if (user.role === 'manager' && task.createdBy._id.toString() !== user.id) {
    const error = new Error('Not authorized to view this task');
    error.code = 'FORBIDDEN';
    throw error;
  }

  return task;
};

export const createNewTask = async (taskData, user) => {
  // Validate assigned user exists and is active
  const assignee = await findUserById(taskData.assignedTo);
  if (!assignee || !assignee.isActive) {
    const error = new Error('Assigned user not found or inactive');
    error.code = 'INVALID_ASSIGNEE';
    throw error;
  }

  const newTaskData = {
    ...taskData,
    createdBy: user.id, // Enforce identity
  };

  return createTask(newTaskData);
};

export const updateExistingTask = async (taskId, updateData, user) => {
  const task = await getTaskById(taskId, user); // verifies existence and authorization
  
  // Protect fields
  delete updateData.createdBy;

  return updateTask(taskId, updateData);
};

export const changeTaskStatus = async (taskId, status, user) => {
  const task = await getTaskById(taskId, user); // verifies existence and authorization

  // Ensure allowed transitions (basic example)
  if (task.status === 'cancelled' || task.status === 'completed') {
    const error = new Error('Cannot change status of a completed or cancelled task');
    error.code = 'INVALID_STATUS_TRANSITION';
    throw error;
  }

  const completionDate = status === 'completed' ? new Date() : null;

  return updateTaskStatus(taskId, status, completionDate);
};

export const cancelExistingTask = async (taskId, user) => {
  const task = await getTaskById(taskId, user);
  return cancelTask(taskId);
};
