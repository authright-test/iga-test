import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
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
  Select,
  Spinner,
  Switch,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiEdit,
  FiMoreVertical,
  FiPlay,
  FiPlus,
  FiSave,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../contexts/AuthContext';
import { useAutomationPolicies } from '../hooks/useAutomationPolicies';

const AutomationPoliciesPage = () => {
  const [selectedPolicy, setSelectedPolicy] = useState(null);
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
  const { organization, logAuditEvent } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    policies,
    templates,
    isLoading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy,
    enablePolicy,
    disablePolicy,
    executePolicy,
    bulkExecute,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getPolicyDetails,
    getTemplateDetails,
    getPolicyHistory,
    getTemplateUsage,
  } = useAutomationPolicies();

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

      const newPolicy = await createPolicy(formData);

      logAuditEvent(
        'policy_created',
        'policy',
        newPolicy.id.toString(),
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
      if (!templateData.name) {
        toast({
          title: 'Validation Error',
          description: 'Template name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const newTemplate = await createTemplate(templateData);

      logAuditEvent(
        'template_created',
        'template',
        newTemplate.id.toString(),
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
      const result = await executePolicy(policy.id);

      logAuditEvent(
        'policy_executed',
        'policy',
        policy.id.toString(),
        { name: policy.name }
      );

      setExecutionResults([result]);
      onExecuteModalOpen();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleBulkExecute = async (selectedPolicies) => {
    try {
      setIsExecuting(true);
      const results = await bulkExecute(selectedPolicies.map(p => p.id));

      logAuditEvent(
        'policies_bulk_executed',
        'policy',
        selectedPolicies.map(p => p.id.toString()).join(','),
        { count: selectedPolicies.length }
      );

      setExecutionResults(results);
      onExecuteModalOpen();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExecuting(false);
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
