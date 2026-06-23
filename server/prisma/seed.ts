import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data...');
  await prisma.maintenanceLog.deleteMany();
  await prisma.assetDependency.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.problemCluster.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Users...');
  const adminPass = await bcrypt.hash('admin123', 10);
  const netPass = await bcrypt.hash('net123', 10);
  const elecPass = await bcrypt.hash('elec123', 10);
  const stuPass = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { name: 'admin', email: 'admin@campus.edu', password: adminPass, role: 'ADMIN', department: 'Administration' }
  });

  const staffNet = await prisma.user.create({
    data: { name: 'netstaff01', email: 'netstaff01@campus.edu', password: netPass, role: 'STAFF', department: 'Network Maintenance' }
  });

  const staffElec = await prisma.user.create({
    data: { name: 'elecstaff01', email: 'elecstaff01@campus.edu', password: elecPass, role: 'STAFF', department: 'Electrical Maintenance' }
  });

  const student = await prisma.user.create({
    data: { name: 'CS24B1012', registerNumber: 'CS24B1012', password: stuPass, year: 2, role: 'STUDENT', department: 'CSE' }
  });

  console.log('Seeding Locations...');
  const mainGate = await prisma.location.create({ data: { id: 'MAIN_GATE', name: 'Main Gate', type: 'BLOCK', x: 500, y: 900 } });
  const adminBlock = await prisma.location.create({ data: { id: 'BLOCK_ADMIN', name: 'Administration Block', type: 'BLOCK', x: 500, y: 780 } });
  
  const blockA = await prisma.location.create({ data: { id: 'BLOCK_A', name: 'Academic Block A', type: 'BLOCK', x: 300, y: 650 } });
  const blockB = await prisma.location.create({ data: { id: 'BLOCK_B', name: 'Academic Block B', type: 'BLOCK', x: 500, y: 650 } });
  const blockC = await prisma.location.create({ data: { id: 'BLOCK_C', name: 'Academic Block C', type: 'BLOCK', x: 700, y: 650 } });
  
  const cseLabs = await prisma.location.create({ data: { id: 'CSE_LABS', name: 'CSE Lab Complex', type: 'BLOCK', x: 250, y: 500 } });
  const eceLabs = await prisma.location.create({ data: { id: 'ECE_LABS', name: 'ECE Lab Complex', type: 'BLOCK', x: 500, y: 500 } });
  const mechLabs = await prisma.location.create({ data: { id: 'MECH_LABS', name: 'Mechanical Lab', type: 'BLOCK', x: 750, y: 500 } });

  const library = await prisma.location.create({ data: { id: 'LIBRARY', name: 'Central Library', type: 'BLOCK', x: 500, y: 350 } });
  const serverRoom = await prisma.location.create({ data: { id: 'SERVER_ROOM', name: 'Main Server Room', type: 'BLOCK', x: 650, y: 350 } });
  
  const hostel = await prisma.location.create({ data: { id: 'HOSTEL', name: 'Hostels', type: 'BLOCK', x: 150, y: 200 } });
  const sports = await prisma.location.create({ data: { id: 'SPORTS', name: 'Sports Complex', type: 'BLOCK', x: 400, y: 150 } });
  const canteen = await prisma.location.create({ data: { id: 'CANTEEN', name: 'Central Canteen', type: 'BLOCK', x: 800, y: 250 } });
  const parking = await prisma.location.create({ data: { id: 'PARKING', name: 'Parking Area', type: 'BLOCK', x: 850, y: 800 } });
  const security = await prisma.location.create({ data: { id: 'SECURITY', name: 'Security Office', type: 'BLOCK', x: 350, y: 880 } });

  console.log('Seeding Assets...');
  
  const coreRouter = await prisma.asset.create({
    data: { id: 'ROUTER_CORE_1', name: 'Core Router Alpha', type: 'NETWORK', locationId: 'SERVER_ROOM', status: 'HEALTHY', reliabilityScore: 98.0, failureCount: 1, maintenanceCostEstimate: 500 }
  });

  const switchBlockA = await prisma.asset.create({
    data: { id: 'SWITCH_BLOCK_A', name: 'Block A Main Switch', type: 'NETWORK', locationId: 'BLOCK_A', status: 'CRITICAL', reliabilityScore: 45.0, failureCount: 6, replacementRecommendation: true, maintenanceCostEstimate: 1200, lastFailureDate: new Date() }
  });

  const wifiCSE = await prisma.asset.create({
    data: { id: 'WIFI_CSE_LAB1', name: 'CSE Lab 1 WiFi AP', type: 'NETWORK', locationId: 'CSE_LABS', status: 'CRITICAL', reliabilityScore: 55.0, failureCount: 4 }
  });

  const projBlockB = await prisma.asset.create({
    data: { id: 'PROJ_BLOCK_B_1', name: 'Block B Smart Board', type: 'AV', locationId: 'BLOCK_B', status: 'HEALTHY', reliabilityScore: 88.0, failureCount: 1 }
  });

  const fanCSE = await prisma.asset.create({
    data: { id: 'FAN_CSE_204', name: 'CSE Lab Ceiling Fan', type: 'ELECTRICAL', locationId: 'CSE_LABS', status: 'WARNING', reliabilityScore: 60.0, failureCount: 6, maintenanceCostEstimate: 50, replacementRecommendation: true }
  });

  const attendanceDevice = await prisma.asset.create({
    data: { id: 'ATTENDANCE_A', name: 'Block A Biometric', type: 'NETWORK', locationId: 'BLOCK_A', status: 'CRITICAL', reliabilityScore: 65.0, failureCount: 2 }
  });

  await prisma.assetDependency.createMany({
    data: [
      { assetId: 'SWITCH_BLOCK_A', dependentOnId: 'ROUTER_CORE_1' },
      { assetId: 'WIFI_CSE_LAB1', dependentOnId: 'SWITCH_BLOCK_A' },
      { assetId: 'ATTENDANCE_A', dependentOnId: 'SWITCH_BLOCK_A' },
    ]
  });

  console.log('Seeding Initial Complaints...');

  const c1 = await prisma.complaint.create({
    data: { 
      title: 'WiFi completely down in CSE Labs', 
      description: 'Cannot connect to internet. Classes are interrupted.', 
      category: 'NETWORK', priority: 'CRITICAL', status: 'OPEN', 
      userId: student.id, assetId: 'WIFI_CSE_LAB1',
      escalationLevel: 'DEPT_ADMIN'
    }
  });

  const c2 = await prisma.complaint.create({
    data: { 
      title: 'Biometric Attendance Offline', 
      description: 'The machine is not connecting to the network.', 
      category: 'NETWORK', priority: 'HIGH', status: 'OPEN', 
      userId: student.id, assetId: 'ATTENDANCE_A'
    }
  });

  await prisma.problemCluster.create({
    data: {
      rootCauseId: 'SWITCH_BLOCK_A', confidence: 99.2, status: 'ACTIVE',
      affectedStudentsCount: 450, affectedLocationsCount: 5, affectedServicesCount: 12,
      impactSeverityScore: 9.5, estimatedDisruptionLevel: 'CRITICAL',
      complaints: { connect: [{ id: c1.id }, { id: c2.id }] }
    }
  });

  await prisma.maintenanceLog.create({
    data: { assetId: 'SWITCH_BLOCK_A', action: 'INSPECTED', cost: 0, notes: 'Switch is showing massive packet loss.', date: new Date(Date.now() - 86400000) }
  });

  console.log('Seed completed successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
