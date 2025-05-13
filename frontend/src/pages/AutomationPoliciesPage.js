import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Spinner,
  Text,
  HStack,
  VStack,
  Switch,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Textarea,
} from '@chakra-ui/react';
import { 
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPlay,
  FiPause,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiSearch,
  FiMoreVertical,
  FiCopy,
  FiSave,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AutomationPoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'repository',
    trigger: 'push',
    conditions: [],
    actions: [],
    schedule: null,
    enabled: true,
  });
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    type: 'repository',
    code: '',
    parameters: [],
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState([]);
  
  const { 
    isOpen: isPolicyModalOpen, 
    onOpen: onPolicyModalOpen, 
    onClose: onPolicyModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isTemplateModalOpen, 
    onOpen: onTemplateModalOpen, 
    onClose: onTemplateModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isExecuteModalOpen, 
    onOpen: onExecuteModalOpen, 
    onClose: onExecuteModalClose 
  } = useDisclosure();

  const toast = useToast();
  const { token, organization, logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchPolicies();
    fetchTemplates();
  }, [organization?.id]);

  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!organization?.id) {
        // Mock data for development
        const mockPolicies = [
          {
            id: 1,
            name: 'Branch Protection',
            description: 'Enforce branch protection rules',
            type: 'repository',
            trigger: 'push',
            conditions: [
              { type: 'branch', value: 'main' },
              { type: 'repository', value: 'frontend-app' }
            ],
            actions: [
              { type: 'require_reviews', value: 2 },
              { type: 'require_status_checks', value: true }
            ],
            schedule: null,
            enabled: true,
            lastExecuted: new Date(Date.now() - 3600000).toISOString(),
            status: 'success',
          },
          {
            id: 2,
            name: 'Security Scan',
            description: 'Run security scans on pull requests',
            type: 'repository',
            trigger: 'pull_request',
            conditions: [
              { type: 'repository', value: 'backend-service' }
            ],
            actions: [
              { type: 'run_security_scan', value: 'full' }
            ],
            schedule: '0 0 * * *',
            enabled: true,
            lastExecuted: new Date(Date.now() - 7200000).toISOString(),
            status: 'pending',
          },
        ];
        
        setPolicies(mockPolicies);
        return;
      }
      
      const response = await axios.get(
        `/api/organizations/${organization.id}/automation-policies`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPolicies(response.data);
    } catch (err) {
      setError('Failed to fetch policies: ' + (err.response?.data?.error || err.message));
      toast({
        title: 'Error fetching policies',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      if (!organization?.id) {
        // Mock templates
        const mockTemplates = [
          {
            id: 1,
            name: 'Branch Protection Template',
            description: 'Template for branch protection rules',
            type: 'repository',
            code: `{
  "conditions": [
    { "type": "branch", "value": "main" }
  ],
  "actions": [
    { "type": "require_reviews", "value": 2 },
    { "type": "require_status_checks", "value": true }
  ]
}`,
            parameters: [
              { name: 'branch', type: 'string', required: true },
              { name: 'reviewers', type: 'number', required: true }
            ],
          },
          {
            id: 2,
            name: 'Security Scan Template',
            description: 'Template for security scanning',
            type: 'repository',
            code: `{
  "conditions": [
    { "type": "repository", "value": "{repository}" }
  ],
  "actions": [
    { "type": "run_security_scan", "value": "{scan_type}" }
  ]
}`,
            parameters: [
              { name: 'repository', type: 'string', required: true },
              { name: 'scan_type', type: 'string', required: true }
            ],
          },
        ];
        
        setTemplates(mockTemplates);
        return;
      }
      
      const response = await axios.get(
        `/api/organizations/${organization.id}/automation-templates`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTemplates(response.data);
    } catch (err) {
      toast({
        title: 'Error fetching templates',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCreatePolicy = async () => {
    try {
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Policy name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!organization?.id) {
        // Mock create
        const newPolicy = {
          id: policies.length + 1,
          ...formData,
          lastExecuted: null,
          status: 'pending',
        };
        
        setPolicies([...policies, newPolicy]);
        
        toast({
          title: 'Policy created',
          description: `Policy "${formData.name}" has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onPolicyModalClose();
        return;
      }
      
      const response = await axios.post(
        `/api/organizations/${organization.id}/automation-policies`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      logAuditEvent(
        'automation_policy_created',
        'policy',
        response.data.id.toString(),
        { name: formData.name }
      );
      
      toast({
        title: 'Policy created',
        description: `Policy "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onPolicyModalClose();
      fetchPolicies();
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

  const handleCreateTemplate = async () => {
    try {
      if (!templateData.name || !templateData.code) {
        toast({
          title: 'Validation Error',
          description: 'Template name and code are required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!organization?.id) {
        // Mock create
        const newTemplate = {
          id: templates.length + 1,
          ...templateData,
        };
        
        setTemplates([...templates, newTemplate]);
        
        toast({
          title: 'Template created',
          description: `Template "${templateData.name}" has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onTemplateModalClose();
        return;
      }
      
      const response = await axios.post(
        `/api/organizations/${organization.id}/automation-templates`,
        templateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      logAuditEvent(
        'automation_template_created',
        'template',
        response.data.id.toString(),
        { name: templateData.name }
      );
      
      toast({
        title: 'Template created',
        description: `Template "${templateData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onTemplateModalClose();
      fetchTemplates();
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

  const handleExecutePolicy = async (policy) => {
    try {
      setIsExecuting(true);
      setSelectedPolicy(policy);
      onExecuteModalOpen();
      
      if (!organization?.id) {
        // Mock execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResult = {
          policyId: policy.id,
          status: 'success',
          timestamp: new Date().toISOString(),
          details: {
            conditions: policy.conditions,
            actions: policy.actions,
            results: policy.actions.map(action => ({
              type: action.type,
              status: 'success',
              message: `Successfully executed ${action.type}`,
            })),
          },
        };
        
        setExecutionResults([mockResult, ...executionResults]);
        
        toast({
          title: 'Policy executed',
          description: `Policy "${policy.name}" has been executed successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setIsExecuting(false);
        return;
      }
      
      const response = await axios.post(
        `/api/organizations/${organization.id}/automation-policies/${policy.id}/execute`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      logAuditEvent(
        'automation_policy_executed',
        'policy',
        policy.id.toString(),
        { name: policy.name }
      );
      
      setExecutionResults([response.data, ...executionResults]);
      
      toast({
        title: 'Policy executed',
        description: `Policy "${policy.name}" has been executed successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsExecuting(false);
    } catch (err) {
      setIsExecuting(false);
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBulkExecute = async (selectedPolicies) => {
    try {
      setIsExecuting(true);
      
      if (!organization?.id) {
        // Mock bulk execution
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResults = selectedPolicies.map(policy => ({
          policyId: policy.id,
          status: 'success',
          timestamp: new Date().toISOString(),
          details: {
            conditions: policy.conditions,
            actions: policy.actions,
            results: policy.actions.map(action => ({
              type: action.type,
              status: 'success',
              message: `Successfully executed ${action.type}`,
            })),
          },
        }));
        
        setExecutionResults([...mockResults, ...executionResults]);
        
        toast({
          title: 'Bulk execution completed',
          description: `${selectedPolicies.length} policies have been executed successfully.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setIsExecuting(false);
        return;
      }
      
      const response = await axios.post(
        `/api/organizations/${organization.id}/automation-policies/bulk-execute`,
        { policyIds: selectedPolicies.map(p => p.id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      logAuditEvent(
        'automation_policies_bulk_executed',
        'policy',
        selectedPolicies.map(p => p.id).join(','),
        { count: selectedPolicies.length }
      );
      
      setExecutionResults([...response.data, ...executionResults]);
      
      toast({
        title: 'Bulk execution completed',
        description: `${selectedPolicies.length} policies have been executed successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setIsExecuting(false);
    } catch (err) {
      setIsExecuting(false);
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.name?.toLowerCase().includes(searchLower) ||
      policy.description?.toLowerCase().includes(searchLower) ||
      policy.type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Automation Policies</Heading>
        <HStack spacing={4}>
          <Button
            leftIcon={<FiPlay />}
            colorScheme="green"
            onClick={() => handleBulkExecute(filteredPolicies)}
            isLoading={isExecuting}
            loadingText="Executing..."
          >
            Execute All
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                type: 'repository',
                trigger: 'push',
                conditions: [],
                actions: [],
                schedule: null,
                enabled: true,
              });
              onPolicyModalOpen();
            }}
          >
            Create Policy
          </Button>
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            onClick={() => {
              setTemplateData({
                name: '',
                description: '',
                type: 'repository',
                code: '',
                parameters: [],
              });
              onTemplateModalOpen();
            }}
          >
            Create Template
          </Button>
        </HStack>
      </Flex>
      
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search policies..."
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
      ) : filteredPolicies.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg">No policies found</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Policy</Th>
                <Th>Type</Th>
                <Th>Trigger</Th>
                <Th>Schedule</Th>
                <Th>Status</Th>
                <Th>Last Executed</Th>
                <Th width="100px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPolicies.map((policy) => (
                <Tr key={policy.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{policy.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {policy.description}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{policy.type}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple">{policy.trigger}</Badge>
                  </Td>
                  <Td>
                    {policy.schedule ? (
                      <HStack>
                        <FiClock />
                        <Text>{policy.schedule}</Text>
                      </HStack>
                    ) : (
                      <Text color="gray.500">-</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        policy.status === 'success' ? 'green' :
                        policy.status === 'pending' ? 'yellow' :
                        policy.status === 'error' ? 'red' : 'gray'
                      }
                    >
                      {policy.status}
                    </Badge>
                  </Td>
                  <Td>
                    {policy.lastExecuted ? (
                      <Text>{new Date(policy.lastExecuted).toLocaleString()}</Text>
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
                          icon={<FiPlay />}
                          onClick={() => handleExecutePolicy(policy)}
                        >
                          Execute Now
                        </MenuItem>
                        <MenuItem
                          icon={<FiEdit />}
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setFormData(policy);
                            onPolicyModalOpen();
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FiCopy />}
                          onClick={() => {
                            setFormData({
                              ...policy,
                              name: `${policy.name} (Copy)`,
                              id: undefined,
                            });
                            onPolicyModalOpen();
                          }}
                        >
                          Duplicate
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
      
      {/* Policy Modal */}
      <Modal isOpen={isPolicyModalOpen} onClose={onPolicyModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPolicy ? 'Edit Policy' : 'Create Policy'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Basic</Tab>
                <Tab>Conditions</Tab>
                <Tab>Actions</Tab>
                <Tab>Schedule</Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          name: e.target.value,
                        })}
                        placeholder="Enter policy name"
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
                        placeholder="Enter policy description"
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
                        <option value="repository">Repository</option>
                        <option value="organization">Organization</option>
                        <option value="team">Team</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Trigger</FormLabel>
                      <Select
                        value={formData.trigger}
                        onChange={(e) => setFormData({
                          ...formData,
                          trigger: e.target.value,
                        })}
                      >
                        <option value="push">Push</option>
                        <option value="pull_request">Pull Request</option>
                        <option value="schedule">Schedule</option>
                        <option value="manual">Manual</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0">Enabled</FormLabel>
                      <Switch
                        isChecked={formData.enabled}
                        onChange={(e) => setFormData({
                          ...formData,
                          enabled: e.target.checked,
                        })}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4}>
                    {/* TODO: Implement conditions editor */}
                    <Text>Conditions editor will be implemented here</Text>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4}>
                    {/* TODO: Implement actions editor */}
                    <Text>Actions editor will be implemented here</Text>
                  </VStack>
                </TabPanel>
                
                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Cron Schedule</FormLabel>
                      <Input
                        value={formData.schedule || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: e.target.value,
                        })}
                        placeholder="0 0 * * *"
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onPolicyModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreatePolicy}>
              {selectedPolicy ? 'Save Changes' : 'Create Policy'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Template Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={onTemplateModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={templateData.name}
                  onChange={(e) => setTemplateData({
                    ...templateData,
                    name: e.target.value,
                  })}
                  placeholder="Enter template name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={templateData.description}
                  onChange={(e) => setTemplateData({
                    ...templateData,
                    description: e.target.value,
                  })}
                  placeholder="Enter template description"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  value={templateData.type}
                  onChange={(e) => setTemplateData({
                    ...templateData,
                    type: e.target.value,
                  })}
                >
                  <option value="repository">Repository</option>
                  <option value="organization">Organization</option>
                  <option value="team">Team</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Code</FormLabel>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  overflow="hidden"
                  position="relative"
                >
                  <SyntaxHighlighter
                    language="json"
                    style={tomorrow}
                    customStyle={{
                      margin: 0,
                      borderRadius: 0,
                    }}
                  >
                    {templateData.code}
                  </SyntaxHighlighter>
                  <Textarea
                    value={templateData.code}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      code: e.target.value,
                    })}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    opacity={0}
                    cursor="text"
                  />
                </Box>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onTemplateModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Execution Results Modal */}
      <Modal isOpen={isExecuteModalOpen} onClose={onExecuteModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Execution Results: {selectedPolicy?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {executionResults
              .filter(result => result.policyId === selectedPolicy?.id)
              .map((result, index) => (
                <Box key={index} mb={4}>
                  <HStack mb={2}>
                    <Badge
                      colorScheme={
                        result.status === 'success' ? 'green' :
                        result.status === 'pending' ? 'yellow' :
                        result.status === 'error' ? 'red' : 'gray'
                      }
                    >
                      {result.status}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(result.timestamp).toLocaleString()}
                    </Text>
                  </HStack>
                  
                  <Box
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    bg="gray.50"
                  >
                    <VStack align="stretch" spacing={2}>
                      {result.details.results.map((action, actionIndex) => (
                        <HStack key={actionIndex}>
                          {action.status === 'success' ? (
                            <FiCheckCircle color="green" />
                          ) : (
                            <FiAlertCircle color="red" />
                          )}
                          <Text>{action.message}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              ))}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onExecuteModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AutomationPoliciesPage; 