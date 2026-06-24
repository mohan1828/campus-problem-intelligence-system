import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate 24 character hexadecimal strings for MongoDB ObjectIds
const hexId = (prefix: string) => prefix.padEnd(24, '0').toLowerCase();

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

  // MongoDB requires unique non-null constraints on unique fields.
  const admin = await prisma.user.create({
    data: { id: hexId('usradmin'), name: 'admin', email: 'admin@campus.com', registerNumber: 'ADMIN-01', password: adminPass, role: 'ADMIN', department: 'CSE' }
  });

  const staffNet = await prisma.user.create({
    data: { id: hexId('usrstaffnet'), name: 'Network Staff', email: 'netstaff01@campus.com', registerNumber: 'STAFF-NET-01', password: netPass, role: 'STAFF', department: 'NETWORK' }
  });

  const staffElec = await prisma.user.create({
    data: { id: hexId('usrstaffelec'), name: 'Electrical Staff', email: 'elecstaff01@campus.com', registerNumber: 'STAFF-ELEC-01', password: elecPass, role: 'STAFF', department: 'ELECTRICAL' }
  });

  const student = await prisma.user.create({
    data: { id: hexId('usrstudent'), name: 'Student User', email: 'student@campus.com', registerNumber: 'CS24B1012', password: stuPass, year: 2, role: 'STUDENT', department: 'CSE' }
  });

  console.log('Seeding Locations...');
  await prisma.location.create({ data: { id: hexId('locmaingate'), name: 'Main Gate', type: 'BLOCK', x: 500, y: 900 } });
  await prisma.location.create({ data: { id: hexId('locadminblock'), name: 'Administration Block', type: 'BLOCK', x: 500, y: 780 } });
  await prisma.location.create({ data: { id: hexId('locblocka'), name: 'Academic Block A', type: 'BLOCK', x: 300, y: 650 } });
  await prisma.location.create({ data: { id: hexId('locblockb'), name: 'Academic Block B', type: 'BLOCK', x: 500, y: 650 } });
  await prisma.location.create({ data: { id: hexId('locblockc'), name: 'Academic Block C', type: 'BLOCK', x: 700, y: 650 } });
  await prisma.location.create({ data: { id: hexId('loccselabs'), name: 'CSE Lab Complex', type: 'BLOCK', x: 250, y: 500 } });
  await prisma.location.create({ data: { id: hexId('locecelabs'), name: 'ECE Lab Complex', type: 'BLOCK', x: 500, y: 500 } });
  await prisma.location.create({ data: { id: hexId('locmechlabs'), name: 'Mechanical Lab', type: 'BLOCK', x: 750, y: 500 } });
  await prisma.location.create({ data: { id: hexId('loclibrary'), name: 'Central Library', type: 'BLOCK', x: 500, y: 350 } });
  await prisma.location.create({ data: { id: hexId('locserverroom'), name: 'Main Server Room', type: 'BLOCK', x: 650, y: 350 } });
  await prisma.location.create({ data: { id: hexId('lochostel'), name: 'Hostels', type: 'BLOCK', x: 150, y: 200 } });
  await prisma.location.create({ data: { id: hexId('locsports'), name: 'Sports Complex', type: 'BLOCK', x: 400, y: 150 } });
  await prisma.location.create({ data: { id: hexId('loccanteen'), name: 'Central Canteen', type: 'BLOCK', x: 800, y: 250 } });
  await prisma.location.create({ data: { id: hexId('locparking'), name: 'Parking Area', type: 'BLOCK', x: 850, y: 800 } });
  await prisma.location.create({ data: { id: hexId('locsecurity'), name: 'Security Office', type: 'BLOCK', x: 350, y: 880 } });

  console.log('Seeding Assets...');
  await prisma.asset.create({
    data: { id: hexId('astcorerouter'), name: 'Core Router Alpha', type: 'NETWORK', locationId: hexId('locserverroom'), status: 'HEALTHY', reliabilityScore: 98.0, failureCount: 1, maintenanceCostEstimate: 500 }
  });

  await prisma.asset.create({
    data: { id: hexId('astswitchblocka'), name: 'Block A Main Switch', type: 'NETWORK', locationId: hexId('locblocka'), status: 'CRITICAL', reliabilityScore: 45.0, failureCount: 6, replacementRecommendation: true, maintenanceCostEstimate: 1200, lastFailureDate: new Date() }
  });

  await prisma.asset.create({
    data: { id: hexId('astwificse'), name: 'CSE Lab 1 WiFi AP', type: 'NETWORK', locationId: hexId('loccselabs'), status: 'CRITICAL', reliabilityScore: 55.0, failureCount: 4 }
  });

  await prisma.asset.create({
    data: { id: hexId('astprojblockb'), name: 'Block B Smart Board', type: 'AV', locationId: hexId('locblockb'), status: 'HEALTHY', reliabilityScore: 88.0, failureCount: 1 }
  });

  await prisma.asset.create({
    data: { id: hexId('astfancse'), name: 'CSE Lab Ceiling Fan', type: 'ELECTRICAL', locationId: hexId('loccselabs'), status: 'WARNING', reliabilityScore: 60.0, failureCount: 6, maintenanceCostEstimate: 50, replacementRecommendation: true }
  });

  await prisma.asset.create({
    data: { id: hexId('astattendancea'), name: 'Block A Biometric', type: 'NETWORK', locationId: hexId('locblocka'), status: 'CRITICAL', reliabilityScore: 65.0, failureCount: 2 }
  });

  console.log('Seeding Asset Dependencies...');
  // Prisma MongoDB createMany doesn't support relation fields easily when referencing hardcoded IDs, so we use create sequentially
  await prisma.assetDependency.create({ data: { id: hexId('dep1'), assetId: hexId('astswitchblocka'), dependentOnId: hexId('astcorerouter') } });
  await prisma.assetDependency.create({ data: { id: hexId('dep2'), assetId: hexId('astwificse'), dependentOnId: hexId('astswitchblocka') } });
  await prisma.assetDependency.create({ data: { id: hexId('dep3'), assetId: hexId('astattendancea'), dependentOnId: hexId('astswitchblocka') } });

  console.log('Seeding Initial Complaints & Problem Clusters...');
  const c1 = await prisma.complaint.create({
    data: { 
      id: hexId('cmp1'),
      title: 'WiFi completely down in CSE Labs', 
      description: 'Cannot connect to internet. Classes are interrupted.', 
      category: 'NETWORK', priority: 'CRITICAL', status: 'OPEN', 
      userId: student.id, assetId: hexId('astwificse'),
      escalationLevel: 'DEPT_ADMIN'
    }
  });

  const c2 = await prisma.complaint.create({
    data: { 
      id: hexId('cmp2'),
      title: 'Biometric Attendance Offline', 
      description: 'The machine is not connecting to the network.', 
      category: 'NETWORK', priority: 'HIGH', status: 'OPEN', 
      userId: student.id, assetId: hexId('astattendancea')
    }
  });

  await prisma.problemCluster.create({
    data: {
      id: hexId('cluster1'),
      rootCauseId: hexId('astswitchblocka'), confidence: 99.2, status: 'ACTIVE',
      affectedStudentsCount: 450, affectedLocationsCount: 5, affectedServicesCount: 12,
      impactSeverityScore: 9.5, estimatedDisruptionLevel: 'CRITICAL',
      complaints: { connect: [{ id: c1.id }, { id: c2.id }] }
    }
  });

  await prisma.maintenanceLog.create({
    data: { id: hexId('log1'), assetId: hexId('astswitchblocka'), action: 'INSPECTED', cost: 0, notes: 'Switch is showing massive packet loss.', date: new Date(Date.now() - 86400000) }
  });

  console.log('Seed completed successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
