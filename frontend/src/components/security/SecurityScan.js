import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSecurity } from '../../../hooks/useSecurity';

const SecurityScan = () => {
  const [scanResults, setScanResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { logAuditEvent } = useAuth();
  const { runSecurityScan, getScanResults } = useSecurity();

  useEffect(() => {
    loadScanResults();
  }, []);

  const loadScanResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await getScanResults();
      setScanResults(results);
    } catch (err) {
      setError('Failed to load security scan results');
      console.error('Error loading scan results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await runSecurityScan();
      logAuditEvent('security_scan_started', 'security_scan', null, {});
      await loadScanResults();
    } catch (err) {
      setError('Failed to run security scan');
      console.error('Error running security scan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setIsDetailsModalOpen(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading && scanResults.length === 0) {
    return (
      <Box p={4} display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress />
      </Box>
    );
  }

  if (error && scanResults.length === 0) {
    return (
      <Box p={4}>
        <Typography variant='h4' color='error' gutterBottom>
          Error
        </Typography>
        <Typography>{error}</Typography>
        <Button
          variant='contained'
          startIcon={<RefreshIcon />}
          onClick={loadScanResults}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={4}>
        <Typography variant='h4'>Security Scan</Typography>
        <Button
          variant='contained'
          startIcon={<SecurityIcon />}
          onClick={handleRunScan}
          disabled={isLoading}
        >
          Run Scan
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Repository</TableCell>
                      <TableCell>Scan Date</TableCell>
                      <TableCell>Findings</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scanResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.repository}</TableCell>
                        <TableCell>
                          {new Date(result.scanDate).toLocaleString()}
                        </TableCell>
                        <TableCell>{result.findingsCount}</TableCell>
                        <TableCell>
                          <Chip
                            label={result.severity}
                            color={getSeverityColor(result.severity)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.status}
                            color={result.status === 'completed' ? 'success' : 'warning'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => handleViewDetails(result)}
                          >
                            <WarningIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Scan Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Stack spacing={3}>
              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Repository
                </Typography>
                <Typography>{selectedResult.repository}</Typography>
              </Box>

              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Scan Date
                </Typography>
                <Typography>
                  {new Date(selectedResult.scanDate).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant='subtitle1' gutterBottom>
                  Findings
                </Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedResult.findings.map((finding, index) => (
                        <TableRow key={index}>
                          <TableCell>{finding.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={finding.severity}
                              color={getSeverityColor(finding.severity)}
                              size='small'
                            />
                          </TableCell>
                          <TableCell>{finding.description}</TableCell>
                          <TableCell>{finding.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {selectedResult.recommendations && (
                <Box>
                  <Typography variant='subtitle1' gutterBottom>
                    Recommendations
                  </Typography>
                  <Stack spacing={1}>
                    {selectedResult.recommendations.map((rec, index) => (
                      <Typography key={index} variant='body2'>
                        • {rec}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityScan;
