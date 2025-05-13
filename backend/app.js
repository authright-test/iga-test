const { router: userRoutes } = require('./routes/userRoutes');
const { router: organizationRoutes } = require('./routes/organizationRoutes');
const { router: repositoryRoutes } = require('./routes/repositoryRoutes');
const { router: policyRoutes } = require('./routes/policyRoutes');
const { router: roleRoutes } = require('./routes/roleRoutes');
const { router: authRoutes } = require('./routes/authRoutes');
const { router: teamRoutes } = require('./routes/teamRoutes');
const { router: auditRoutes } = require('./routes/auditRoutes');

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/audit', auditRoutes); 