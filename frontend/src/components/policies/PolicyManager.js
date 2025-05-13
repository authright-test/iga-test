import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stack,
  HStack,
  VStack,
  Icon,
  Badge,
  useColorModeValue,
  Button,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiShield, FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { usePolicies } from '../../hooks/usePolicies';

const PolicyManager = () => {
  const { policies, isLoading, error, createPolicy, updatePolicy, deletePolicy } = usePolicies();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleCreatePolicy = async (policyData) => {
    try {
      await createPolicy(policyData);
      onClose();
    } catch (err) {
      console.error('Failed to create policy:', err);
    }
  };

  const handleUpdatePolicy = async (policyId, policyData) => {
    try {
      await updatePolicy(policyId, policyData);
      onClose();
    } catch (err) {
      console.error('Failed to update policy:', err);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await deletePolicy(policyId);
      } catch (err) {
        console.error('Failed to delete policy:', err);
      }
    }
  };

  return (
    <Stack spacing={6}>
      {/* Policy Overview */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Policy Management</Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => {
                setSelectedPolicy(null);
                onOpen();
              }}
            >
              New Policy
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <Tabs onChange={(index) => setActiveTab(index)}>
            <TabList>
              <Tab>Active Policies</Tab>
              <Tab>Policy Templates</Tab>
              <Tab>Policy Compliance</Tab>
            </TabList>

            <TabPanels>
              {/* Active Policies */}
              <TabPanel>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Last Modified</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {policies?.map((policy) => (
                      <Tr key={policy.id}>
                        <Td>{policy.name}</Td>
                        <Td>{policy.type}</Td>
                        <Td>
                          <Badge
                            colorScheme={policy.status === 'active' ? 'green' : 'gray'}
                          >
                            {policy.status}
                          </Badge>
                        </Td>
                        <Td>{new Date(policy.lastModified).toLocaleString()}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tooltip label="Edit Policy">
                              <IconButton
                                icon={<FiEdit2 />}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  onOpen();
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Policy">
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeletePolicy(policy.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TabPanel>

              {/* Policy Templates */}
              <TabPanel>
                <Stack spacing={4}>
                  {policies?.filter(p => p.isTemplate)?.map((template) => (
                    <PolicyTemplateCard
                      key={template.id}
                      template={template}
                      onApply={() => {
                        setSelectedPolicy(template);
                        onOpen();
                      }}
                    />
                  ))}
                </Stack>
              </TabPanel>

              {/* Policy Compliance */}
              <TabPanel>
                <Stack spacing={4}>
                  {policies?.map((policy) => (
                    <PolicyComplianceCard
                      key={policy.id}
                      policy={policy}
                    />
                  ))}
                </Stack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Policy Editor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPolicy ? 'Edit Policy' : 'Create New Policy'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PolicyEditor
              policy={selectedPolicy}
              onSubmit={selectedPolicy ? handleUpdatePolicy : handleCreatePolicy}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

const PolicyTemplateCard = ({ template, onApply }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="sm">{template.name}</Heading>
            <Text fontSize="sm" color="gray.500">{template.description}</Text>
          </VStack>
          <Button
            leftIcon={<FiCheck />}
            size="sm"
            onClick={onApply}
          >
            Apply Template
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
};

const PolicyComplianceCard = ({ policy }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Heading size="sm">{policy.name}</Heading>
            <Badge
              colorScheme={
                policy.compliance >= 90 ? 'green' :
                policy.compliance >= 70 ? 'yellow' : 'red'
              }
            >
              {policy.compliance}% Compliant
            </Badge>
          </HStack>
          <Box>
            <Text fontSize="sm" color="gray.500">
              Last Check: {new Date(policy.lastComplianceCheck).toLocaleString()}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Violations: {policy.violations}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

const PolicyEditor = ({ policy, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(policy || {
    name: '',
    type: '',
    description: '',
    rules: [],
    status: 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(policy?.id, formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Policy Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Policy Type</FormLabel>
          <Select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="access">Access Control</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Switch
            isChecked={formData.status === 'active'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              status: e.target.checked ? 'active' : 'inactive'
            }))}
          />
          <FormHelperText>
            {formData.status === 'active' ? 'Policy is active' : 'Policy is inactive'}
          </FormHelperText>
        </FormControl>

        <HStack justify="flex-end" spacing={4}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" colorScheme="blue">
            {policy ? 'Update Policy' : 'Create Policy'}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
};

export default PolicyManager; 