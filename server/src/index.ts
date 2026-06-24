import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
async function seedDemoUsers() {
  try {
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
            registerNumber: 'ADMIN-01',
            password: adminPass,
            role: 'ADMIN',
            department: 'CSE'
          },
          {
            name: 'Student User',
            email: 'student@campus.com',
            registerNumber: 'CS24B1012',
            password: studentPass,
            role: 'STUDENT',
            department: 'CSE',
            year: 2
          },
          {
            name: 'Network Staff',
            email: 'netstaff01@campus.com',
            registerNumber: 'STAFF-NET-01',
            password: netPass,
            role: 'STAFF',
            department: 'NETWORK'
          },
          {
            name: 'Electrical Staff',
            email: 'elecstaff01@campus.com',
            registerNumber: 'STAFF-ELEC-01',
            password: elecPass,
            role: 'STAFF',
            department: 'ELECTRICAL'
          }
        ]
      });
      console.log('Demo users seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding demo users:', err);
  }
}

// Seed on startup
seedDemoUsers();
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { email: `${username}@campus.com` },
          { registerNumber: username },
          { name: username }
        ]
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/campus-map', async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/assets', async (req, res) => {
  try {
    const assets = await prisma.asset.findMany();
    res.json(assets);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany();
    res.json(complaints);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/clusters', async (req, res) => {
  try {
    const clusters = await prisma.problemCluster.findMany();
    res.json(clusters);
  } catch (error) {
    res.status(500).json([]);
  }
});

app.get('/api/analytics', async (req, res) => {
  res.json({
    totalComplaints: 0,
    resolvedComplaints: 0,
    activeClusters: 0,
    criticalAssets: 0
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});