import { router as userRoutes } from './routes/userRoutes.js';
import { router as organizationRoutes } from './routes/organizationRoutes.js';
import { router as repositoryRoutes } from './routes/repositoryRoutes.js';
import { router as policyRoutes } from './routes/policyRoutes.js';
import { router as roleRoutes } from './routes/roleRoutes.js';
import { router as authRoutes } from './routes/authRoutes.js';
import { router as teamRoutes } from './routes/teamRoutes.js';
import { router as auditRoutes } from './routes/auditRoutes.js';

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/audit', auditRoutes); 