import mongoose from 'mongoose';

const taskInstanceSchema = new mongoose.Schema(
  {
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    occurrenceDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    completionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskInstanceSchema.index({ parentTaskId: 1 });
taskInstanceSchema.index({ assignedTo: 1 });
taskInstanceSchema.index({ status: 1 });

export default mongoose.model('TaskInstance', taskInstanceSchema);
