import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListIcon,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiCheck,
  FiDownload,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
} from 'react-icons/fi';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useComplianceReports } from '../hooks/useComplianceReports';

const ComplianceReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'security',
    schedule: 'daily',
    parameters: {},
  });

  const {
    isOpen: isReportModalOpen,
    onOpen: onReportModalOpen,
    onClose: onReportModalClose
  } = useDisclosure();

  const {
    isOpen: isDetailsModalOpen,
    onOpen: onDetailsModalOpen,
    onClose: onDetailsModalClose
  } = useDisclosure();

  const toast = useToast();
  const { logAuditEvent, organization } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    reports,
    violations,
    isLoading,
    error,
    createReport,
    generateReport,
    downloadReport,
    deleteReport,
    getComplianceStats,
    getReportDetails,
    getViolationDetails,
    resolveViolation,
    exportReport,
  } = useComplianceReports();

  useEffect(() => {
    if (organization?.id) {
      getComplianceStats();
    }
  }, [organization?.id]);

  const handleCreateReport = async () => {
    try {
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Report name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newReport = await createReport(formData);

      logAuditEvent(
        'report_created',
        'report',
        newReport.id.toString(),
        { name: formData.name }
      );

      toast({
        title: 'Report created',
        description: `Report "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onReportModalClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateReport = async (report) => {
    try {
      const generatedReport = await generateReport(report.id);

      logAuditEvent(
        'report_generated',
        'report',
        report.id.toString(),
        { name: report.name }
      );

      toast({
        title: 'Report generated',
        description: `Report "${report.name}" has been generated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const reportData = await downloadReport(report.id);

      logAuditEvent(
        'report_downloaded',
        'report',
        report.id.toString(),
        { name: report.name }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([reportData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Report downloaded',
        description: `Report "${report.name}" has been downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.name?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower) ||
      report.type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Compliance Reports</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              type: 'security',
              schedule: 'daily',
              parameters: {},
            });
            onReportModalOpen();
          }}
        >
          Create Report
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Overall Score</StatLabel>
              <StatNumber>{riskScores.overall}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                5% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Security Score</StatLabel>
              <StatNumber>{riskScores.security}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                3% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Compliance Score</StatLabel>
              <StatNumber>{riskScores.compliance}%</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                2% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Access Control Score</StatLabel>
              <StatNumber>{riskScores.access}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                4% from last week
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Box mb={6}>
        <Heading size="md" mb={4}>Compliance Trends</Heading>
        <Box height="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="security" stroke="#3182CE" />
              <Line type="monotone" dataKey="compliance" stroke="#38A169" />
              <Line type="monotone" dataKey="access" stroke="#805AD5" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      <Box mb={6}>
        <Heading size="md" mb={4}>Recent Violations</Heading>
        <List spacing={3}>
          {violations.map((violation) => (
            <ListItem key={violation.id}>
              <Card>
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Badge
                          colorScheme={
                            violation.severity === 'high' ? 'red' :
                            violation.severity === 'medium' ? 'yellow' :
                            'green'
                          }
                        >
                          {violation.severity}
                        </Badge>
                        <Badge colorScheme="blue">{violation.type}</Badge>
                        {violation.status === 'resolved' && (
                          <Badge colorScheme="green">Resolved</Badge>
                        )}
                      </HStack>
                      <Text fontWeight="medium">{violation.description}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Affected: {violation.affected.join(', ')}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(violation.timestamp).toLocaleString()}
                      </Text>
                    </VStack>
                    {violation.status === 'open' && (
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={() => {/* TODO: Implement resolve */}}
                      >
                        Resolve
                      </Button>
                    )}
                  </HStack>
                </CardBody>
              </Card>
            </ListItem>
          ))}
        </List>
      </Box>

      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius="md"
          />
        </InputGroup>
      </Flex>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      ) : filteredReports.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg">No reports found</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Report</Th>
                <Th>Type</Th>
                <Th>Schedule</Th>
                <Th>Score</Th>
                <Th>Last Generated</Th>
                <Th width="100px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReports.map((report) => (
                <Tr key={report.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{report.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {report.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{report.type}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple">{report.schedule}</Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Progress
                        value={report.score}
                        colorScheme={
                          report.score >= 90 ? 'green' :
                          report.score >= 70 ? 'yellow' :
                          'red'
                        }
                        width="100px"
                      />
                      <Text>{report.score}%</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {report.lastGenerated ? (
                      <Text>{new Date(report.lastGenerated).toLocaleString()}</Text>
                    ) : (
                      <Text color="gray.500">Never</Text>
                    )}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        aria-label="Options"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FiRefreshCw />}
                          onClick={() => handleGenerateReport(report)}
                        >
                          Generate Now
                        </MenuItem>
                        <MenuItem
                          icon={<FiDownload />}
                          onClick={() => handleDownloadReport(report)}
                        >
                          Download
                        </MenuItem>
                        <MenuItem
                          icon={<FiBarChart2 />}
                          onClick={() => {
                            setSelectedReport(report);
                            onDetailsModalOpen();
                          }}
                        >
                          View Details
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => {/* TODO: Implement delete */}}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Report Modal */}
      <Modal isOpen={isReportModalOpen} onClose={onReportModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Create Compliance Report
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    name: e.target.value,
                  })}
                  placeholder="Enter report name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    description: e.target.value,
                  })}
                  placeholder="Enter report description"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value,
                  })}
                >
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="access">Access Control</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Schedule</FormLabel>
                <Select
                  value={formData.schedule}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: e.target.value,
                  })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onReportModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreateReport}>
              Create Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Report Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={onDetailsModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Report Details: {selectedReport?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Overview</Tab>
                <Tab>Violations</Tab>
                <Tab>Recommendations</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="medium" mb={2}>Score Breakdown</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Security</Text>
                          <Progress
                            value={80}
                            colorScheme="blue"
                            mb={2}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Compliance</Text>
                          <Progress
                            value={75}
                            colorScheme="green"
                            mb={2}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Access Control</Text>
                          <Progress
                            value={85}
                            colorScheme="purple"
                            mb={2}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Policy Adherence</Text>
                          <Progress
                            value={90}
                            colorScheme="yellow"
                            mb={2}
                          />
                        </Box>
                      </SimpleGrid>
                    </Box>

                    <Box>
                      <Text fontWeight="medium" mb={2}>Key Metrics</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontSize="sm" color="gray.500">Total Violations</Text>
                          <Text fontSize="2xl" fontWeight="bold">12</Text>
                        </Box>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontSize="sm" color="gray.500">Critical Issues</Text>
                          <Text fontSize="2xl" fontWeight="bold" color="red.500">3</Text>
                        </Box>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontSize="sm" color="gray.500">Resolved Issues</Text>
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">8</Text>
                        </Box>
                        <Box p={4} borderWidth="1px" borderRadius="md">
                          <Text fontSize="sm" color="gray.500">Pending Actions</Text>
                          <Text fontSize="2xl" fontWeight="bold" color="yellow.500">4</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {violations
                      .filter(v => v.type === selectedReport?.type)
                      .map((violation) => (
                        <Box
                          key={violation.id}
                          p={4}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <HStack justify="space-between" mb={2}>
                            <Badge
                              colorScheme={
                                violation.severity === 'high' ? 'red' :
                                violation.severity === 'medium' ? 'yellow' :
                                'green'
                              }
                            >
                              {violation.severity}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(violation.timestamp).toLocaleString()}
                            </Text>
                          </HStack>
                          <Text fontWeight="medium" mb={2}>
                            {violation.description}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            Affected: {violation.affected.join(', ')}
                          </Text>
                        </Box>
                      ))}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <HStack mb={2}>
                        <FiAlertTriangle color="red" />
                        <Text fontWeight="medium">High Priority</Text>
                      </HStack>
                      <List spacing={2}>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Implement MFA for all admin users
                        </ListItem>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Review and update branch protection rules
                        </ListItem>
                      </List>
                    </Box>

                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <HStack mb={2}>
                        <FiAlertCircle color="yellow" />
                        <Text fontWeight="medium">Medium Priority</Text>
                      </HStack>
                      <List spacing={2}>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Update outdated dependencies
                        </ListItem>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Review team permissions
                        </ListItem>
                      </List>
                    </Box>

                    <Box p={4} borderWidth="1px" borderRadius="md">
                      <HStack mb={2}>
                        <FiShield color="blue" />
                        <Text fontWeight="medium">Low Priority</Text>
                      </HStack>
                      <List spacing={2}>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Update documentation
                        </ListItem>
                        <ListItem>
                          <ListIcon as={FiCheck} color="green.500" />
                          Clean up unused repositories
                        </ListItem>
                      </List>
                    </Box>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDetailsModalClose}>
              Close
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="brand"
              onClick={() => handleDownloadReport(selectedReport)}
            >
              Download Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ComplianceReportsPage;
