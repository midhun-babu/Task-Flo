import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../src/models/User.js';
import Task from '../src/models/Task.js';

const sendReminders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for checking reminders...');

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or any other service you use
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Find incomplete high priority tasks or recurring tasks (example)
    const pendingTasks = await Task.find({ status: { $ne: 'completed' }, priority: 'high' }).populate('createdBy');

    if (pendingTasks.length === 0) {
      console.log('No pending high priority tasks to remind.');
    } else {
      for (const task of pendingTasks) {
        if (task.createdBy && task.createdBy.email) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: task.createdBy.email,
            subject: `Task Reminder: ${task.title}`,
            text: `Hello ${task.createdBy.name},\n\nThis is a reminder for your high-priority task: "${task.title}".\n\nDescription: ${task.description}\n\nPlease check your Task-Flo dashboard.\n\nThanks,\nTask-Flo Team`
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Reminder sent to ${task.createdBy.email} for task: ${task.title}`);
          } catch (err) {
            console.error(`Failed to send email to ${task.createdBy.email}:`, err.message);
          }
        }
      }
    }

    console.log('Reminder check finished.');
    process.exit(0);
  } catch (error) {
    console.error('Error during reminder check:', error);
    process.exit(1);
  }
};

sendReminders();
