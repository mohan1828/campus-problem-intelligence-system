const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
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

    console.log("existing student:", existingStudent);

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
      console.log('Demo users seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding demo users:', err);
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
