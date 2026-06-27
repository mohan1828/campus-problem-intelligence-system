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

app.get('/', (req, res) => {
  res.send('Campus Intelligence API is running successfully!');
});

// Users
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

// Assets & Locations
app.get('/api/locations', async (req, res) => {
  const locs = await prisma.location.findMany({ include: { assets: true } });
  res.json(locs);
});

app.get('/api/assets', async (req, res) => {
  const assets = await prisma.asset.findMany({ include: { location: true } });
  res.json(assets);
});

// Complaints
app.get('/api/complaints', async (req, res) => {
  const userReq = (req as any).user;
  const whereClause = userReq?.role === 'STUDENT' ? { userId: userReq.id } : {};

  const complaints = await prisma.complaint.findMany({
    where: whereClause,
    include: { user: { select: { id: true, role: true, department: true, registerNumber: true, year: true, name: true } }, asset: { include: { location: true } }, cluster: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(complaints);
});

app.get('/api/complaints/:id', async (req, res) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, role: true, department: true, registerNumber: true, year: true, name: true } }, asset: { include: { location: true, dependentOn: { include: { dependentOnAsset: true } } } }, cluster: true },
  });
  res.json(complaint);
});

app.post('/api/complaints/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.json({ assets: [], category: null, similar: [] });
  
  const t = text.toLowerCase();
  let category = 'INFRASTRUCTURE';
  if (t.includes('wifi') || t.includes('network') || t.includes('internet')) category = 'NETWORK';
  if (t.includes('power') || t.includes('electricity') || t.includes('fan')) category = 'ELECTRICAL';
  if (t.includes('projector') || t.includes('board') || t.includes('audio')) category = 'AV';

  // Find assets
  const assets = await prisma.asset.findMany();
  const matchedAssets = assets.filter(a => t.includes(a.type.toLowerCase()) || t.includes(a.name.toLowerCase())).slice(0,3);

  // Similar complaints
  const similar = await prisma.complaint.findMany({
    where: { category },
    take: 3
  });

  res.json({
    category,
    assets: matchedAssets,
    similar,
    potentialRootCause: matchedAssets.length > 0 ? 'Possible upstream switch or breaker failure.' : null
  });
});

app.post('/api/complaints', async (req, res) => {
  const { title, description, category, priority, assetId, imageUrl, userId } = req.body;
  
  const complaint = await prisma.complaint.create({
    data: {
      title, description, category, priority, imageUrl,
      status: 'OPEN',
      userId: userId,
      assetId: assetId || null
    }
  });

  if (assetId) {
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: priority === 'CRITICAL' || priority === 'HIGH' ? 'CRITICAL' : 'WARNING', failureCount: { increment: 1 }, lastFailureDate: new Date() }
    });

    const asset = await prisma.asset.findUnique({ where: { id: assetId }, include: { dependentOn: true } });
    if (asset && asset.dependentOn.length > 0) {
      const rootAssetId = asset.dependentOn[0].dependentOnId;
      
      let cluster = await prisma.problemCluster.findFirst({
        where: { rootCauseId: rootAssetId, status: 'ACTIVE' }
      });

      if (!cluster) {
        cluster = await prisma.problemCluster.create({
          data: {
            rootCauseId: rootAssetId, confidence: 92.5, status: 'ACTIVE',
            affectedStudentsCount: Math.floor(Math.random() * 200) + 100,
            affectedLocationsCount: 2, affectedServicesCount: 3,
            impactSeverityScore: priority === 'CRITICAL' ? 9.2 : 7.0,
            estimatedDisruptionLevel: priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM'
          }
        });
      }

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { clusterId: cluster.id }
      });
    }
  }

  res.json(complaint);
});

app.put('/api/complaints/:id', async (req, res) => {
  const { status, resolutionNote, resolutionImageUrl, checklist } = req.body;
  
  const data: any = {};
  if (status) data.status = status;
  if (checklist) data.checklist = checklist;
  if (status === 'RESOLVED') {
    data.resolvedAt = new Date();
    data.resolutionNote = resolutionNote;
    if (resolutionImageUrl) data.resolutionImageUrl = resolutionImageUrl;
  }

  const complaint = await prisma.complaint.update({
    where: { id: req.params.id },
    data,
    include: { asset: true, cluster: { include: { complaints: true } } }
  });

  if (status === 'RESOLVED' && complaint.assetId) {
    const openComplaints = await prisma.complaint.count({
      where: { assetId: complaint.assetId, status: { not: 'RESOLVED' } }
    });

    if (openComplaints === 0) {
      await prisma.asset.update({
        where: { id: complaint.assetId },
        data: { status: 'HEALTHY' }
      });
    }

    await prisma.maintenanceLog.create({
      data: {
        assetId: complaint.assetId,
        action: 'REPAIRED',
        notes: resolutionNote || 'Resolved via complaint portal',
        date: new Date()
      }
    });

    if (complaint.clusterId) {
      const openClusterComplaints = await prisma.complaint.count({
        where: { clusterId: complaint.clusterId, status: { not: 'RESOLVED' } }
      });
      if (openClusterComplaints === 0) {
        await prisma.problemCluster.update({
          where: { id: complaint.clusterId },
          data: { status: 'RESOLVED', resolvedAt: new Date() }
        });
      }
    }
  }

  res.json(complaint);
});

// Get Digital Twin map data
app.get('/api/campus-map', async (req, res) => {
  const locations = await prisma.location.findMany({ include: { assets: true } });
  res.json(locations);
});

// Clusters
app.get('/api/clusters', async (req, res) => {
  const clusters = await prisma.problemCluster.findMany({
    include: { complaints: { include: { asset: { include: { location: true } } } } },
    orderBy: { impactSeverityScore: 'desc' }
  });
  res.json(clusters);
});

// Asset DNA
app.get('/api/assets/:id/dna', async (req, res) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: {
      maintenanceLogs: { orderBy: { date: 'desc' } },
      complaints: { orderBy: { createdAt: 'desc' } },
      dependencies: { include: { dependentOnAsset: true } },
      dependentOn: { include: { asset: true } },
      location: true
    }
  });
  if (!asset) return res.status(404).json({ error: 'Not found' });
  res.json(asset);
});

// Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    // 1. Fetch base data for counts and aggregations
    const assets = await prisma.asset.findMany();
    const complaints = await prisma.complaint.findMany({ include: { user: true, asset: { include: { location: true } } } });

    // 2. Active Clusters: Count only ProblemCluster documents where status = ACTIVE
    const activeClustersCount = await prisma.problemCluster.count({
      where: { status: 'ACTIVE' }
    });

    // 3. Critical Assets: Count only Asset documents where status is CRITICAL
    const criticalAssetsCount = await prisma.asset.count({
      where: { status: 'CRITICAL' }
    });

    // 4. Active Complaints: Count only complaints whose status is OPEN or IN_PROGRESS
    const activeComplaintsCount = await prisma.complaint.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
    });

    // Escalated and Resolved Today metrics
    const escalatedCount = await prisma.complaint.count({
      where: { escalationLevel: { not: 'NONE' }, status: { not: 'RESOLVED' } }
    });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const resolvedTodayCount = await prisma.complaint.count({
      where: { status: 'RESOLVED', resolvedAt: { gte: startOfDay } }
    });

    // 5. Campus Health Score Calculation
    // Calculates health using total assets, healthy assets, warning assets, and critical assets.
    // Deducts a dynamic penalty for active complaints to ensure the score accurately reflects the infrastructure state.
    const calculateHealth = (assetList: any[], activeComps: number) => {
      if (assetList.length === 0) return 100;

      const avgReliability =
          assetList.reduce(
              (sum, asset) => sum + (asset.reliabilityScore || 100),
              0
          ) / assetList.length;

      const complaintPenalty = activeComps * 2;

      return Math.max(
          0,
          Math.min(100,
              Math.round(avgReliability - complaintPenalty)
          )
      );
    };

    const netActiveComps = complaints.filter(c => c.category === 'NETWORK' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
    const elecActiveComps = complaints.filter(c => c.category === 'ELECTRICAL' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;
    const avActiveComps = complaints.filter(c => c.category === 'AV' && (c.status === 'OPEN' || c.status === 'IN_PROGRESS')).length;

    const overallHealth = calculateHealth(assets, activeComplaintsCount);
    const netHealth = calculateHealth(assets.filter(a => a.type === 'NETWORK'), netActiveComps);
    const elecHealth = calculateHealth(assets.filter(a => a.type === 'ELECTRICAL'), elecActiveComps);
    const avHealth = calculateHealth(assets.filter(a => a.type === 'AV'), avActiveComps);

    // 6. Chart & Breakdown Data
    const byCategory = complaints.reduce((acc: any, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});

    const byDepartment = complaints.reduce((acc: any, c) => {
      const dept = c.user?.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const byStatus = complaints.reduce((acc: any, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      health: {
        overall: overallHealth,
        network: netHealth,
        electrical: elecHealth,
        av: avHealth
      },
      metrics: {
        activeClusters: activeClustersCount,
        criticalAssets: criticalAssetsCount,
        activeComplaints: activeComplaintsCount,
        resolvedToday: resolvedTodayCount,
        escalated: escalatedCount
      },
      byCategory: Object.keys(byCategory).map(k => ({ name: k, value: byCategory[k] })),
      byDepartment: Object.keys(byDepartment).map(k => ({ name: k, value: byDepartment[k] })),
      byStatus: Object.keys(byStatus).map(k => ({ name: k, value: byStatus[k] }))
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to calculate analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
