import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).required(),
  description: Joi.string().trim().max(2000).optional().allow(''),
  assignedTo: Joi.string().hex().length(24).required(), // MongoDB ObjectId
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  dueDate: Joi.date().iso().required(),
  scheduleType: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom').default('none'),
  recurrence: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').required(),
    interval: Joi.number().min(1).optional(),
    daysOfWeek: Joi.array().items(Joi.number().min(0).max(6)).optional(),
    endDate: Joi.date().iso().optional(),
  }).optional(),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(255).optional(),
  description: Joi.string().trim().max(2000).optional().allow(''),
  assignedTo: Joi.string().hex().length(24).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  dueDate: Joi.date().iso().optional(),
  scheduleType: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom').optional(),
  recurrence: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').required(),
    interval: Joi.number().min(1).optional(),
    daysOfWeek: Joi.array().items(Joi.number().min(0).max(6)).optional(),
    endDate: Joi.date().iso().optional(),
  }).optional(),
}).min(1); // At least one field is required

export const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').required(),
});

export const taskQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  assignedTo: Joi.string().hex().length(24).optional(),
  scheduleType: Joi.string().valid('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom').optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'dueDate', 'priority', 'title').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
