import {
  getTasks,
  getTaskById,
  createNewTask,
  updateExistingTask,
  changeTaskStatus,
  cancelExistingTask,
} from '../services/taskService.js';
import { successResponse } from '../utils/response.js';

export const getAllTasks = async (req, res, next) => {
  try {
    const { tasks, pagination } = await getTasks(req.user, req.query);
    return successResponse(res, 200, tasks, pagination);
  } catch (error) {
    next(error);
  }
};

export const getSingleTask = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id, req.user);
    return successResponse(res, 200, task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await createNewTask(req.body, req.user);
    return successResponse(res, 201, task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await updateExistingTask(req.params.id, req.body, req.user);
    return successResponse(res, 200, task);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await changeTaskStatus(req.params.id, req.body.status, req.user);
    return successResponse(res, 200, task);
  } catch (error) {
    next(error);
  }
};

export const cancelTask = async (req, res, next) => {
  try {
    const task = await cancelExistingTask(req.params.id, req.user);
    return successResponse(res, 200, task);
  } catch (error) {
    next(error);
  }
};
