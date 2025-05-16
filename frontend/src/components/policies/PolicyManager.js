import {
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Field,
  Heading,
  IconButton,
  Input,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { usePolicies } from '../../hooks/usePolicies';

const PolicyManager = () => {
  const { policies, isLoading, error, createPolicy, updatePolicy, deletePolicy } = usePolicies();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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
    <Stack gap={6}>
      {/* Policy Overview */}
      <Card borderWidth='1px'>
        <Card.Header>
          <Stack justify='space-between'>
            <Heading size='md'>Policy Management</Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme='blue'
              onClick={() => {
                setSelectedPolicy(null);
                onOpen();
              }}
            >
              New Policy
            </Button>
          </Stack>
        </Card.Header>
        <Card.Body>
          <Tabs.Root onChange={(index) => setActiveTab(index)}>
            <Tabs.List>
              <Tabs.Trigger>Active Policies</Tabs.Trigger>
              <Tabs.Trigger>Policy Templates</Tabs.Trigger>
              <Tabs.Trigger>Policy Compliance</Tabs.Trigger>
            </Tabs.List>


            {/* Active Policies */}
            <Tabs.Content>
              <Table.Root variant='simple'>
                <Table.Header>
                  <Table.Row>
                    <Table.Cell>Name</Table.Cell>
                    <Table.Cell>Type</Table.Cell>
                    <Table.Cell>Status</Table.Cell>
                    <Table.Cell>Last Modified</Table.Cell>
                    <Table.Cell>Actions</Table.Cell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {policies?.map((policy) => (
                    <Table.Row key={policy.id}>
                      <Table.Cell>{policy.name}</Table.Cell>
                      <Table.Cell>{policy.type}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={policy.status === 'active' ? 'green' : 'gray'}
                        >
                          {policy.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{new Date(policy.lastModified).toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Stack gap={2}>
                          <Tooltip label='Edit Policy'>
                            <IconButton
                              icon={<FiEdit2 />}
                              size='sm'
                              variant='ghost'
                              onClick={() => {
                                setSelectedPolicy(policy);
                                onOpen();
                              }}
                            />
                          </Tooltip>
                          <Tooltip label='Delete Policy'>
                            <IconButton
                              icon={<FiTrash2 />}
                              size='sm'
                              variant='ghost'
                              colorScheme='red'
                              onClick={() => handleDeletePolicy(policy.id)}
                            />
                          </Tooltip>
                        </Stack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Tabs.Content>

            {/* Policy Templates */}
            <Tabs.Content>
              <Stack gap={4}>
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
            </Tabs.Content>

            {/* Policy Compliance */}
            <Tabs.Content>
              <Stack gap={4}>
                {policies?.map((policy) => (
                  <PolicyComplianceCard
                    key={policy.id}
                    policy={policy}
                  />
                ))}
              </Stack>
            </Tabs.Content>

          </Tabs.Root>
        </Card.Body>
      </Card>

      {/* Policy Editor Modal */}
      <Dialog.Root open={isOpen} onClose={onClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Content>
          <Dialog.Header>
            {selectedPolicy ? 'Edit Policy' : 'Create New Policy'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <PolicyEditor
              policy={selectedPolicy}
              onSubmit={selectedPolicy ? handleUpdatePolicy : handleCreatePolicy}
              onCancel={onClose}
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </Stack>
  );
};

const PolicyTemplateCard = ({ template, onApply }) => {
  return (
    <Card borderWidth='1px'>
      <Card.Body>
        <Stack justify='space-between'>
          <Stack direction="column" align='start' spacing={1}>
            <Heading size='sm'>{template.name}</Heading>
            <Text fontSize='sm' color='gray.500'>{template.description}</Text>
          </Stack>
          <Button
            leftIcon={<FiCheck />}
            size='sm'
            onClick={onApply}
          >
            Apply Template
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
};

const PolicyComplianceCard = ({ policy }) => {
  return (
    <Card borderWidth='1px'>
      <Card.Body>
        <Stack direction="column" align='stretch' spacing={4}>
          <Stack justify='space-between'>
            <Heading size='sm'>{policy.name}</Heading>
            <Badge
              colorScheme={
                policy.compliance >= 90 ? 'green' :
                  policy.compliance >= 70 ? 'yellow' : 'red'
              }
            >
              {policy.compliance}% Compliant
            </Badge>
          </Stack>
          <Box>
            <Text fontSize='sm' color='gray.500'>
              Last Check: {new Date(policy.lastComplianceCheck).toLocaleString()}
            </Text>
            <Text fontSize='sm' color='gray.500'>
              Violations: {policy.violations}
            </Text>
          </Box>
        </Stack>
      </Card.Body>
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
      <Stack gap={4}>
        <Field.Root required>
          <Field.Label>Policy Name</Field.Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>Policy Type</Field.Label>
          <Select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value='access'>Access Control</option>
            <option value='security'>Security</option>
            <option value='compliance'>Compliance</option>
          </Select>
        </Field.Root>

        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Status</Field.Label>
          <Switch.Root
            checked={formData.status === 'active'}
            onCheckedChange={(e) => setFormData(prev => ({
              ...prev,
              status: e.checked ? 'active' : 'inactive'
            }))}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label />
          </Switch.Root>
          <Field.HelperText>
            {formData.status === 'active' ? 'Policy is active' : 'Policy is inactive'}
          </Field.HelperText>
        </Field.Root>

        <Stack justify='flex-end' spacing={4}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type='submit' colorScheme='blue'>
            {policy ? 'Update Policy' : 'Create Policy'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
};

export default PolicyManager;
