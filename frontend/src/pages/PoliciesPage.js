import { toaster } from '@/components/ui/toaster';
import {
  Alert,
  Badge,
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Spinner,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

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

  const { token, organization } = useAuth();
  const { hasPermission } = usePermissions();
  const [formErrors, setFormErrors] = useState({});

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
      toaster.create({
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

      toaster.create({
        title: policy.isActive ? 'Policy deactivated' : 'Policy activated',
        description: `The policy "${policy.name}" has been ${policy.isActive ? 'deactivated' : 'activated'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toaster.create({
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
        toaster.create({
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
          toaster.create({
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

        toaster.create({
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

        toaster.create({
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
      toaster.create({
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

      toaster.create({
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
      toaster.create({
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

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Policy name is required';
    }
    for (const condition of formData.conditions) {
      if (!condition.field || !condition.value) {
        errors.conditions = 'All conditions must have field and value';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (!hasPermission('policies.manage')) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Access Denied</Heading>
        <Text>You do not have permission to manage policies.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent='space-between' alignItems='center' mb={6}>
        <Heading as='h1' size='lg'>Policies</Heading>
        <Button leftIcon={<FiPlus />} colorScheme='brand' onClick={handleCreatePolicy}>
          Create Policy
        </Button>
      </Flex>

      {error && (
        <Alert.Root status='error' mb={4}>
          <Alert.Indicator />
          <Alert.Title>
            {error}
          </Alert.Title>
        </Alert.Root>
      )}

      {isLoading ? (
        <Stack justify='center' align='center' height='200px'>
          <Spinner size='xl' color='brand.500' />
        </Stack>
      ) : policies.length === 0 ? (
        <Box p={5} textAlign='center' borderWidth='1px' borderRadius='md'>
          <Text fontSize='lg' mb={4}>No policies found</Text>
          <Button leftIcon={<FiPlus />} colorScheme='brand' onClick={handleCreatePolicy}>
            Create Policy
          </Button>
        </Box>
      ) : (
        <Box

          borderWidth='1px'

          borderRadius='lg'
          overflow='hidden'
        >
          <Table.Root variant='simple'>
            <Table.Header bg='gray.50'>
              <Table.Row>
                <Table.Cell>Name</Table.Cell>
                <Table.Cell>Description</Table.Cell>
                <Table.Cell>Severity</Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell width='180px'>Actions</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {policies.map((policy) => (
                <Table.Row key={policy.id}>
                  <Table.Cell fontWeight='medium'>{policy.name}</Table.Cell>
                  <Table.Cell>{policy.description || 'No description'}</Table.Cell>
                  <Table.Cell>{getSeverityBadge(policy.severity)}</Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme={policy.isActive ? 'green' : 'gray'}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Stack gap={2}>
                      <IconButton
                        icon={<FiEdit />}
                        aria-label='Edit policy'
                        size='sm'
                        colorScheme='blue'
                        onClick={() => handleEditPolicy(policy)}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        aria-label='Delete policy'
                        size='sm'
                        colorScheme='red'
                        onClick={() => handleDeleteClick(policy)}
                      />
                      <IconButton
                        icon={policy.isActive ? <FiX /> : <FiCheck />}
                        aria-label={policy.isActive ? 'Deactivate policy' : 'Activate policy'}
                        size='sm'
                        colorScheme={policy.isActive ? 'orange' : 'green'}
                        onClick={() => handleToggleActive(policy)}
                      />
                    </Stack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Policy Create/Edit Modal */}
      <Dialog.Root open={isPolicyModalOpen} onClose={onPolicyModalClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              {selectedPolicy ? `Edit Policy: ${selectedPolicy.name}` : 'Create Policy'}
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Field.Root id='name' required invalid={!!formErrors.name}>
                <Field.Label>Policy Name</Field.Label>
                <Input
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Enter policy name'
                />
                <Field.ErrorText>{formErrors.name}</Field.ErrorText>
              </Field.Root>

              <Field.Root id='description' mb={4}>
                <Field.Label>Description</Field.Label>
                <Textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Enter policy description'
                />
              </Field.Root>

              <Flex gap={4} mb={4}>
                <Field.Root id='severity'>
                  <Field.Label>Severity</Field.Label>
                  <Select
                    name='severity'
                    value={formData.severity}
                    onChange={handleInputChange}
                  >
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                    <option value='critical'>Critical</option>
                  </Select>
                </Field.Root>

                <Field.Root id='isActive' display='flex' alignItems='center'>
                  <Field.Label mb={0}>Active</Field.Label>
                  <Switch.Root
                    name='isActive'
                    checked={formData.isActive}
                    onChange={handleToggleChange}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label />
                  </Switch.Root>
                </Field.Root>
              </Flex>

              <Field.Root invalid={!!formErrors.conditions}>
                <Field.Label>Conditions</Field.Label>
                {formData.conditions.map((condition, index) => (
                  <Stack key={index} mb={2}>
                    <Select
                      value={condition.type}
                      onChange={(e) => handleConditionChange(index, 'type', e.target.value)}
                    >
                      <option value='equals'>Equals</option>
                      <option value='contains'>Contains</option>
                      <option value='starts_with'>Starts With</option>
                      <option value='ends_with'>Ends With</option>
                    </Select>
                    <Input
                      placeholder='Field'
                      value={condition.field}
                      onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                    />
                    <Input
                      placeholder='Value'
                      value={condition.value}
                      onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                    />
                    <IconButton
                      icon={<FiX />}
                      onClick={() => removeCondition(index)}
                      aria-label='Remove condition'
                    />
                  </Stack>
                ))}
                <Button leftIcon={<FiPlus />} onClick={addCondition} size='sm' mb={4}>
                  Add Condition
                </Button>
                <Field.ErrorText>{formErrors.conditions}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!formErrors.actions}>
                <Field.Label>Actions</Field.Label>
                {formData.actions.map((action, index) => (
                  <Stack key={index} mb={2}>
                    <Select
                      value={action.type}
                      onChange={(e) => handleActionChange(index, e.target.value)}
                    >
                      <option value='notify_admin'>Notify Admin</option>
                      <option value='revert_change'>Revert Change</option>
                      <option value='log_event'>Log Event</option>
                      <option value='remove_permission'>Remove Permission</option>
                    </Select>
                    <IconButton
                      icon={<FiX />}
                      onClick={() => removeAction(index)}
                      aria-label='Remove action'
                    />
                  </Stack>
                ))}
                <Button leftIcon={<FiPlus />} onClick={addAction} size='sm' mb={4}>
                  Add Action
                </Button>
                <Field.ErrorText>{formErrors.actions}</Field.ErrorText>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='outline' mr={3} onClick={onPolicyModalClose}>
                Cancel
              </Button>
              <Button colorScheme='brand' onClick={handleSavePolicy}>
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Delete Policy</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Text>
                Are you sure you want to delete the policy "{selectedPolicy?.name}"? This action cannot be undone.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='outline' mr={3} onClick={onDeleteModalClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleDeletePolicy}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default PoliciesPage;
