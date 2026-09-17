import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../src/models/User.js';
import Task from '../src/models/Task.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Task.deleteMany();

    // Insert Dummy Users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@taskflo.com', password: 'password123', role: 'admin' },
      { name: 'Regular User', email: 'user@taskflo.com', password: 'password123', role: 'user' },
    ]);

    // Insert Dummy Tasks
    await Task.insertMany([
      { title: 'Setup Server', description: 'Configure Node.js server', status: 'Completed', priority: 'High', createdBy: users[0]._id },
      { title: 'Create Frontend', description: 'Build light mode UI', status: 'In Progress', priority: 'Medium', createdBy: users[0]._id },
      { title: 'Write Seed Script', description: 'Insert dummy data to DB', status: 'To Do', priority: 'Low', createdBy: users[1]._id },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
