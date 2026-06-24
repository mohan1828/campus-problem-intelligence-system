import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data...');
  // Delete in proper order to avoid cascading issues (though MongoDB handles this differently)
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

  // Valid 24-character hex strings for MongoDB ObjectIds
  const uAdmin = 'a10000000000000000000001';
  const uNet = 'a10000000000000000000002';
  const uElec = 'a10000000000000000000003';
  const uStudent = 'a10000000000000000000004';

  const admin = await prisma.user.create({
    data: { id: uAdmin, name: 'admin', email: 'admin@campus.com', registerNumber: 'ADMIN-01', password: adminPass, role: 'ADMIN', department: 'CSE' }
  });

  const staffNet = await prisma.user.create({
    data: { id: uNet, name: 'Network Staff', email: 'netstaff01@campus.com', registerNumber: 'STAFF-NET-01', password: netPass, role: 'STAFF', department: 'NETWORK' }
  });

  const staffElec = await prisma.user.create({
    data: { id: uElec, name: 'Electrical Staff', email: 'elecstaff01@campus.com', registerNumber: 'STAFF-ELEC-01', password: elecPass, role: 'STAFF', department: 'ELECTRICAL' }
  });

  const student = await prisma.user.create({
    data: { id: uStudent, name: 'Student User', email: 'student@campus.com', registerNumber: 'CS24B1012', password: stuPass, year: 2, role: 'STUDENT', department: 'CSE' }
  });

  console.log('Seeding Locations...');
  const lMainGate = 'b20000000000000000000001';
  const lAdminBlock = 'b20000000000000000000002';
  const lBlockA = 'b20000000000000000000003';
  const lBlockB = 'b20000000000000000000004';
  const lBlockC = 'b20000000000000000000005';
  const lCseLabs = 'b20000000000000000000006';
  const lEceLabs = 'b20000000000000000000007';
  const lMechLabs = 'b20000000000000000000008';
  const lLibrary = 'b20000000000000000000009';
  const lServerRoom = 'b20000000000000000000010';
  const lHostel = 'b20000000000000000000011';
  const lSports = 'b20000000000000000000012';
  const lCanteen = 'b20000000000000000000013';
  const lParking = 'b20000000000000000000014';
  const lSecurity = 'b20000000000000000000015';

  await prisma.location.create({ data: { id: lMainGate, name: 'Main Gate', type: 'BLOCK', x: 500, y: 900 } });
  await prisma.location.create({ data: { id: lAdminBlock, name: 'Administration Block', type: 'BLOCK', x: 500, y: 780 } });
  await prisma.location.create({ data: { id: lBlockA, name: 'Academic Block A', type: 'BLOCK', x: 300, y: 650 } });
  await prisma.location.create({ data: { id: lBlockB, name: 'Academic Block B', type: 'BLOCK', x: 500, y: 650 } });
  await prisma.location.create({ data: { id: lBlockC, name: 'Academic Block C', type: 'BLOCK', x: 700, y: 650 } });
  await prisma.location.create({ data: { id: lCseLabs, name: 'CSE Lab Complex', type: 'BLOCK', x: 250, y: 500 } });
  await prisma.location.create({ data: { id: lEceLabs, name: 'ECE Lab Complex', type: 'BLOCK', x: 500, y: 500 } });
  await prisma.location.create({ data: { id: lMechLabs, name: 'Mechanical Lab', type: 'BLOCK', x: 750, y: 500 } });
  await prisma.location.create({ data: { id: lLibrary, name: 'Central Library', type: 'BLOCK', x: 500, y: 350 } });
  await prisma.location.create({ data: { id: lServerRoom, name: 'Main Server Room', type: 'BLOCK', x: 650, y: 350 } });
  await prisma.location.create({ data: { id: lHostel, name: 'Hostels', type: 'BLOCK', x: 150, y: 200 } });
  await prisma.location.create({ data: { id: lSports, name: 'Sports Complex', type: 'BLOCK', x: 400, y: 150 } });
  await prisma.location.create({ data: { id: lCanteen, name: 'Central Canteen', type: 'BLOCK', x: 800, y: 250 } });
  await prisma.location.create({ data: { id: lParking, name: 'Parking Area', type: 'BLOCK', x: 850, y: 800 } });
  await prisma.location.create({ data: { id: lSecurity, name: 'Security Office', type: 'BLOCK', x: 350, y: 880 } });

  console.log('Seeding Assets...');
  const aRouter = 'c30000000000000000000001';
  const aSwitch = 'c30000000000000000000002';
  const aWifi = 'c30000000000000000000003';
  const aProj = 'c30000000000000000000004';
  const aFan = 'c30000000000000000000005';
  const aAttnd = 'c30000000000000000000006';

  await prisma.asset.create({
    data: { id: aRouter, name: 'Core Router Alpha', type: 'NETWORK', locationId: lServerRoom, status: 'HEALTHY', reliabilityScore: 98.0, failureCount: 1, maintenanceCostEstimate: 500 }
  });

  await prisma.asset.create({
    data: { id: aSwitch, name: 'Block A Main Switch', type: 'NETWORK', locationId: lBlockA, status: 'CRITICAL', reliabilityScore: 45.0, failureCount: 6, replacementRecommendation: true, maintenanceCostEstimate: 1200, lastFailureDate: new Date() }
  });

  await prisma.asset.create({
    data: { id: aWifi, name: 'CSE Lab 1 WiFi AP', type: 'NETWORK', locationId: lCseLabs, status: 'CRITICAL', reliabilityScore: 55.0, failureCount: 4 }
  });

  await prisma.asset.create({
    data: { id: aProj, name: 'Block B Smart Board', type: 'AV', locationId: lBlockB, status: 'HEALTHY', reliabilityScore: 88.0, failureCount: 1 }
  });

  await prisma.asset.create({
    data: { id: aFan, name: 'CSE Lab Ceiling Fan', type: 'ELECTRICAL', locationId: lCseLabs, status: 'WARNING', reliabilityScore: 60.0, failureCount: 6, maintenanceCostEstimate: 50, replacementRecommendation: true }
  });

  await prisma.asset.create({
    data: { id: aAttnd, name: 'Block A Biometric', type: 'NETWORK', locationId: lBlockA, status: 'CRITICAL', reliabilityScore: 65.0, failureCount: 2 }
  });

  console.log('Seeding Asset Dependencies...');
  await prisma.assetDependency.create({ data: { id: 'd40000000000000000000001', assetId: aSwitch, dependentOnId: aRouter } });
  await prisma.assetDependency.create({ data: { id: 'd40000000000000000000002', assetId: aWifi, dependentOnId: aSwitch } });
  await prisma.assetDependency.create({ data: { id: 'd40000000000000000000003', assetId: aAttnd, dependentOnId: aSwitch } });

  console.log('Seeding Initial Complaints & Problem Clusters...');
  const c1Id = 'e50000000000000000000001';
  const c2Id = 'e50000000000000000000002';

  const c1 = await prisma.complaint.create({
    data: { 
      id: c1Id,
      title: 'WiFi completely down in CSE Labs', 
      description: 'Cannot connect to internet. Classes are interrupted.', 
      category: 'NETWORK', priority: 'CRITICAL', status: 'OPEN', 
      userId: student.id, assetId: aWifi,
      escalationLevel: 'DEPT_ADMIN'
    }
  });

  const c2 = await prisma.complaint.create({
    data: { 
      id: c2Id,
      title: 'Biometric Attendance Offline', 
      description: 'The machine is not connecting to the network.', 
      category: 'NETWORK', priority: 'HIGH', status: 'OPEN', 
      userId: student.id, assetId: aAttnd
    }
  });

  await prisma.problemCluster.create({
    data: {
      id: 'f60000000000000000000001',
      rootCauseId: aSwitch, confidence: 99.2, status: 'ACTIVE',
      affectedStudentsCount: 450, affectedLocationsCount: 5, affectedServicesCount: 12,
      impactSeverityScore: 9.5, estimatedDisruptionLevel: 'CRITICAL',
      complaints: { connect: [{ id: c1Id }, { id: c2Id }] }
    }
  });

  await prisma.maintenanceLog.create({
    data: { id: 'f70000000000000000000001', assetId: aSwitch, action: 'INSPECTED', cost: 0, notes: 'Switch is showing massive packet loss.', date: new Date(Date.now() - 86400000) }
  });

  console.log('Seed completed successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
