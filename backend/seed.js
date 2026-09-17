import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from './src/models/User.js';
import Task from './src/models/Task.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();
    console.log('🗑️  Cleared existing data');

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);

    // Insert Dummy Users (roles: admin | manager | employee)
    const users = await User.insertMany([
      { name: 'Admin User',   email: 'admin@taskflo.com',   password: hashedPassword, role: 'admin',    department: 'Engineering' },
      { name: 'Manager Mike', email: 'manager@taskflo.com', password: hashedPassword, role: 'manager',  department: 'Engineering' },
      { name: 'Employee Eve', email: 'employee@taskflo.com',password: hashedPassword, role: 'employee', department: 'Design'      },
    ]);
    console.log(`👤 Inserted ${users.length} users`);

    const now = new Date();
    const nextWeek  = new Date(now.getTime() + 7  * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Insert Dummy Tasks
    // statuses: pending | in_progress | completed | cancelled
    // priorities: low | medium | high | critical
    await Task.insertMany([
      {
        title: 'Setup Server',
        description: 'Configure Node.js + Express server and connect MongoDB',
        status: 'completed', priority: 'high',
        createdBy: users[0]._id, assignedTo: users[1]._id,
        dueDate: now, completionDate: now,
      },
      {
        title: 'Design API Routes',
        description: 'Plan and implement REST API routes for tasks and auth',
        status: 'completed', priority: 'high',
        createdBy: users[0]._id, assignedTo: users[1]._id,
        dueDate: now, completionDate: now,
      },
      {
        title: 'Build Frontend UI',
        description: 'Create the immersive light-mode vanilla JS frontend',
        status: 'in_progress', priority: 'medium',
        createdBy: users[1]._id, assignedTo: users[2]._id,
        dueDate: nextWeek,
      },
      {
        title: 'Write Unit Tests',
        description: 'Cover controllers and services with Jest tests',
        status: 'in_progress', priority: 'medium',
        createdBy: users[1]._id, assignedTo: users[2]._id,
        dueDate: nextWeek,
      },
      {
        title: 'Setup Email Reminders',
        description: 'Integrate Nodemailer for recurring high priority task reminders',
        status: 'pending', priority: 'high',
        createdBy: users[0]._id, assignedTo: users[1]._id,
        dueDate: nextWeek,
        scheduleType: 'daily',
        recurrence: { frequency: 'daily', interval: 1, endDate: nextMonth },
      },
      {
        title: 'Deploy to Cloud',
        description: 'Deploy backend to Railway and frontend to Vercel',
        status: 'pending', priority: 'low',
        createdBy: users[0]._id, assignedTo: users[2]._id,
        dueDate: nextMonth,
      },
    ]);
    console.log('📋 Inserted 6 dummy tasks');

    console.log('\n🌱 Database seeded successfully!');
    console.log('----------------------------------');
    console.log('Login credentials (all use password: password123):');
    console.log('  Admin    → admin@taskflo.com');
    console.log('  Manager  → manager@taskflo.com');
    console.log('  Employee → employee@taskflo.com');
    console.log('----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
