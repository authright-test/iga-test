import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
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
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen: isPolicyModalOpen, onOpen: onPolicyModalOpen, onClose: onPolicyModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium',
    isActive: true,
    conditions: [{ type: 'equals', field: '', value: '' }],
    actions: [{ type: 'notify_admin' }],
    organizationId: ''
  });
  const toast = useToast();
  const { token, organization } = useAuth();

  // Fetch policies on component mount
  useEffect(() => {
    if (organization?.id) {
      fetchPolicies(organization.id);
    }
  }, [organization]);

  // Fetch all policies for current organization
  const fetchPolicies = async (orgId) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/policies?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle toggle change
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle condition changes
  const handleConditionChange = (index, field, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setFormData({ ...formData, conditions: updatedConditions });
  };

  // Add a new condition
  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { type: 'equals', field: '', value: '' }]
    });
  };

  // Remove a condition
  const removeCondition = (index) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions.splice(index, 1);
    setFormData({ ...formData, conditions: updatedConditions });
  };

  // Handle action changes
  const handleActionChange = (index, value) => {
    const updatedActions = [...formData.actions];
    updatedActions[index] = { type: value };
    setFormData({ ...formData, actions: updatedActions });
  };

  // Add a new action
  const addAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'notify_admin' }]
    });
  };

  // Remove an action
  const removeAction = (index) => {
    const updatedActions = [...formData.actions];
    updatedActions.splice(index, 1);
    setFormData({ ...formData, actions: updatedActions });
  };

  // Open modal for creating a new policy
  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setFormData({
      name: '',
      description: '',
      severity: 'medium',
      isActive: true,
      conditions: [{ type: 'equals', field: '', value: '' }],
      actions: [{ type: 'notify_admin' }],
      organizationId: organization?.id || ''
    });
    onPolicyModalOpen();
  };

  // Open modal for editing an existing policy
  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description || '',
      severity: policy.severity || 'medium',
      isActive: policy.isActive,
      conditions: policy.conditions || [{ type: 'equals', field: '', value: '' }],
      actions: policy.actions || [{ type: 'notify_admin' }],
      organizationId: organization?.id || ''
    });
    onPolicyModalOpen();
  };

  // Open modal for confirming policy deletion
  const handleDeleteClick = (policy) => {
    setSelectedPolicy(policy);
    onDeleteModalOpen();
  };

  // Toggle policy active status
  const handleToggleActive = async (policy) => {
    try {
      if (policy.isActive) {
        await axios.post(`/api/policies/${policy.id}/deactivate`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`/api/policies/${policy.id}/activate`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Refresh policies
      fetchPolicies(organization.id);

      toast({
        title: policy.isActive ? 'Policy deactivated' : 'Policy activated',
        description: `The policy "${policy.name}" has been ${policy.isActive ? 'deactivated' : 'activated'}.`,
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

  // Handle policy save (create or update)
  const handleSavePolicy = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Policy name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate conditions
      for (const condition of formData.conditions) {
        if (!condition.field || !condition.value) {
          toast({
            title: 'Validation Error',
            description: 'All conditions must have field and value',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      if (selectedPolicy) {
        // Update existing policy
        await axios.put(`/api/policies/${selectedPolicy.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast({
          title: 'Policy updated',
          description: `The policy "${formData.name}" has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new policy
        await axios.post('/api/policies', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast({
          title: 'Policy created',
          description: `The policy "${formData.name}" has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Close modal and refresh policies
      onPolicyModalClose();
      fetchPolicies(organization.id);
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

  // Handle policy deletion
  const handleDeletePolicy = async () => {
    try {
      await axios.delete(`/api/policies/${selectedPolicy.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Policy deleted',
        description: `The policy "${selectedPolicy.name}" has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close modal and refresh policies
      onDeleteModalClose();
      fetchPolicies(organization.id);
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

  // Format severity for display
  const getSeverityBadge = (severity) => {
    const colorMap = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red'
    };

    return (
      <Badge colorScheme={colorMap[severity] || 'gray'}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Policies</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreatePolicy}>
          Create Policy
        </Button>
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
      ) : policies.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" mb={4}>No policies found</Text>
          <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreatePolicy}>
            Create Policy
          </Button>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th width="180px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {policies.map((policy) => (
                <Tr key={policy.id}>
                  <Td fontWeight="medium">{policy.name}</Td>
                  <Td>{policy.description || 'No description'}</Td>
                  <Td>{getSeverityBadge(policy.severity)}</Td>
                  <Td>
                    <Badge colorScheme={policy.isActive ? 'green' : 'gray'}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FiEdit />}
                        aria-label="Edit policy"
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleEditPolicy(policy)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label="Delete policy"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(policy)}
                      />
                      <IconButton
                        icon={policy.isActive ? <FiX /> : <FiCheck />}
                        aria-label={policy.isActive ? "Deactivate policy" : "Activate policy"}
                        size="sm"
                        colorScheme={policy.isActive ? "orange" : "green"}
                        onClick={() => handleToggleActive(policy)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Policy Create/Edit Modal */}
      <Modal isOpen={isPolicyModalOpen} onClose={onPolicyModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPolicy ? `Edit Policy: ${selectedPolicy.name}` : 'Create Policy'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="name" isRequired mb={4}>
              <FormLabel>Policy Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter policy name"
              />
            </FormControl>

            <FormControl id="description" mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter policy description"
              />
            </FormControl>

            <Flex gap={4} mb={4}>
              <FormControl id="severity">
                <FormLabel>Severity</FormLabel>
                <Select
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </FormControl>

              <FormControl id="isActive" display="flex" alignItems="center">
                <FormLabel mb="0">Active</FormLabel>
                <Switch
                  name="isActive"
                  isChecked={formData.isActive}
                  onChange={handleToggleChange}
                  colorScheme="green"
                  size="lg"
                />
              </FormControl>
            </Flex>

            <Box mb={4}>
              <FormLabel>Conditions</FormLabel>
              <FormHelperText mb={2}>Define when this policy should be triggered.</FormHelperText>

              {formData.conditions.map((condition, index) => (
                <Flex key={index} gap={2} mb={2} align="center">
                  <Select
                    value={condition.type}
                    onChange={(e) => handleConditionChange(index, 'type', e.target.value)}
                    width="150px"
                  >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                  </Select>

                  <Input
                    placeholder="Field (e.g., repository.visibility)"
                    value={condition.field}
                    onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                  />

                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  />

                  <IconButton
                    icon={<FiTrash2 />}
                    colorScheme="red"
                    aria-label="Remove condition"
                    size="sm"
                    isDisabled={formData.conditions.length === 1}
                    onClick={() => removeCondition(index)}
                  />
                </Flex>
              ))}

              <Button size="sm" onClick={addCondition} mt={2}>
                Add Condition
              </Button>
            </Box>

            <Box mb={4}>
              <FormLabel>Actions</FormLabel>
              <FormHelperText mb={2}>Define what should happen when policy is triggered.</FormHelperText>

              {formData.actions.map((action, index) => (
                <Flex key={index} gap={2} mb={2} align="center">
                  <Select
                    value={action.type}
                    onChange={(e) => handleActionChange(index, e.target.value)}
                  >
                    <option value="notify_admin">Notify Admin</option>
                    <option value="revert_change">Revert Change</option>
                    <option value="log_event">Log Event</option>
                    <option value="remove_permission">Remove Permission</option>
                  </Select>

                  <IconButton
                    icon={<FiTrash2 />}
                    colorScheme="red"
                    aria-label="Remove action"
                    size="sm"
                    isDisabled={formData.actions.length === 1}
                    onClick={() => removeAction(index)}
                  />
                </Flex>
              ))}

              <Button size="sm" onClick={addAction} mt={2}>
                Add Action
              </Button>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onPolicyModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSavePolicy}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the policy "{selectedPolicy?.name}"? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeletePolicy}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PoliciesPage;
