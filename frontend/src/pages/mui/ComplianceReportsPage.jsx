import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useComplianceReports } from '../../hooks/useComplianceReports';
import { usePermissions } from '../../hooks/usePermissions';

const ComplianceReportsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: '',
    schedule: '',
    parameters: {},
  });

  const { logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

  const {
    reports,
    isLoading,
    error,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    downloadReport,
  } = useComplianceReports();

  const handleCreateReport = () => {
    createReport(newReport);
    setIsCreateDialogOpen(false);
    setNewReport({
      name: '',
      description: '',
      type: '',
      schedule: '',
      parameters: {},
    });
  };

  const handleUpdateReport = () => {
    updateReport(selectedReport.id, selectedReport);
    setIsEditDialogOpen(false);
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      deleteReport(reportId);
    }
  };

  const handleGenerateReport = (reportId) => {
    generateReport(reportId);
  };

  const handleDownloadReport = (reportId) => {
    downloadReport(reportId);
  };

  if (!hasPermission('compliance_reports.view')) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Access Denied</Typography>
        <Typography>You do not have permission to view compliance reports.</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Loading compliance reports...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography variant='h4' gutterBottom>Error loading compliance reports</Typography>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Compliance Reports</Typography>
        {hasPermission('compliance_reports.create') && (
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Report
          </Button>
        )}
      </Stack>

      <Grid container spacing={3}>
        {reports?.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card>
              <CardHeader
                title={report.name}
                subheader={report.description}
                action={
                  <Stack direction='row' spacing={1}>
                    {hasPermission('compliance_reports.edit') && (
                      <IconButton
                        onClick={() => {
                          setSelectedReport(report);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasPermission('compliance_reports.delete') && (
                      <IconButton onClick={() => handleDeleteReport(report.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Type
                    </Typography>
                    <Typography variant='body2'>{report.type}</Typography>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Schedule
                    </Typography>
                    <Typography variant='body2'>{report.schedule}</Typography>
                  </Box>

                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Parameters
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {Object.entries(report?.parameters)?.map(([key, value]) => (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      ))}
                    </Stack>
                  </Box>

                  <Divider />

                  <Stack direction='row' spacing={2} justifyContent='flex-end'>
                    {hasPermission('compliance_reports.generate') && (
                      <Button
                        variant='outlined'
                        startIcon={<RefreshIcon />}
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        Generate
                      </Button>
                    )}
                    {hasPermission('compliance_reports.download') && (
                      <Button
                        variant='outlined'
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        Download
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Report Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Create Compliance Report</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label='Name'
              value={newReport.name}
              onChange={(e) =>
                setNewReport((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label='Description'
              value={newReport.description}
              onChange={(e) =>
                setNewReport((prev) => ({ ...prev, description: e.target.value }))
              }
              multiline
              rows={3}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newReport.type}
                onChange={(e) =>
                  setNewReport((prev) => ({ ...prev, type: e.target.value }))
                }
                label='Type'
              >
                <MenuItem value='access_audit'>Access Audit</MenuItem>
                <MenuItem value='security_scan'>Security Scan</MenuItem>
                <MenuItem value='compliance_check'>Compliance Check</MenuItem>
                <MenuItem value='activity_summary'>Activity Summary</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Schedule</InputLabel>
              <Select
                value={newReport.schedule}
                onChange={(e) =>
                  setNewReport((prev) => ({ ...prev, schedule: e.target.value }))
                }
                label='Schedule'
              >
                <MenuItem value='daily'>Daily</MenuItem>
                <MenuItem value='weekly'>Weekly</MenuItem>
                <MenuItem value='monthly'>Monthly</MenuItem>
                <MenuItem value='quarterly'>Quarterly</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateReport} variant='contained'>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Compliance Report</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label='Name'
                value={selectedReport.name}
                onChange={(e) =>
                  setSelectedReport((prev) => ({ ...prev, name: e.target.value }))
                }
                fullWidth
              />
              <TextField
                label='Description'
                value={selectedReport.description}
                onChange={(e) =>
                  setSelectedReport((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedReport.type}
                  onChange={(e) =>
                    setSelectedReport((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  label='Type'
                >
                  <MenuItem value='access_audit'>Access Audit</MenuItem>
                  <MenuItem value='security_scan'>Security Scan</MenuItem>
                  <MenuItem value='compliance_check'>Compliance Check</MenuItem>
                  <MenuItem value='activity_summary'>Activity Summary</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Schedule</InputLabel>
                <Select
                  value={selectedReport.schedule}
                  onChange={(e) =>
                    setSelectedReport((prev) => ({
                      ...prev,
                      schedule: e.target.value,
                    }))
                  }
                  label='Schedule'
                >
                  <MenuItem value='daily'>Daily</MenuItem>
                  <MenuItem value='weekly'>Weekly</MenuItem>
                  <MenuItem value='monthly'>Monthly</MenuItem>
                  <MenuItem value='quarterly'>Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateReport} variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceReportsPage;
