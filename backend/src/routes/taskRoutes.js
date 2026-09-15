import express from 'express';
import {
  getAllTasks,
  getSingleTask,
  createTask,
  updateTask,
  updateTaskStatus,
  cancelTask,
} from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
} from '../validators/taskValidator.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

router
  .route('/')
  .get(validate(taskQuerySchema, 'query'), getAllTasks)
  .post(authorize('manager', 'admin'), validate(createTaskSchema), createTask);

router
  .route('/:id')
  .get(getSingleTask)
  .patch(authorize('manager', 'admin'), validate(updateTaskSchema), updateTask)
  .delete(authorize('manager', 'admin'), cancelTask);

router
  .route('/:id/status')
  .patch(validate(updateTaskStatusSchema), updateTaskStatus);

export default router;
