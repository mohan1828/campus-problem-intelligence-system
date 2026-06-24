import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
app.get('/api/create-demo-users', async (req, res) => {
  const adminPass = await bcrypt.hash('admin123', 10);
  const studentPass = await bcrypt.hash('password123', 10);
  const netPass = await bcrypt.hash('net123', 10);
  const elecPass = await bcrypt.hash('elec123', 10);

  const existingStudent = await prisma.user.findUnique({
  where: {
    registerNumber: 'CS24B1012'
  }
});

if (!existingStudent) {
  await prisma.user.createMany({
    data: [
      {
        name: 'admin',
        email: 'admin@campus.com',
        password: adminPass,
        role: 'ADMIN',
        department: 'CSE'
      },
      {
        name: 'Student User',
        registerNumber: 'CS24B1012',
        password: studentPass,
        role: 'STUDENT',
        department: 'CSE',
        year: 2
      },
      {
        name: 'Network Staff',
        email: 'netstaff01@campus.com',
        password: netPass,
        role: 'STAFF',
        department: 'NETWORK'
      },
      {
        name: 'Electrical Staff',
        email: 'elecstaff01@campus.com',
        password: elecPass,
        role: 'STAFF',
        department: 'ELECTRICAL'
      }
    ]
  });
}

  res.json({ message: 'Demo users created' });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});