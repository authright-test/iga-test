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
  InputGroup,
  Menu,
  MenuItem,
  MenuItemGroup,
  Select,
  Separator,
  Spinner,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  Textarea,
  useDisclosure,
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
import { usePermissions } from '../hooks/usePermissions';

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

  const { organization, logAuditEvent } = useAuth();
  const { hasPermission } = usePermissions();

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

  const [formErrors, setFormErrors] = useState({});
  const [templateErrors, setTemplateErrors] = useState({});

  const validatePolicyForm = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = 'Policy name is required';
    }
    if (!formData.type) {
      errors.type = 'Policy type is required';
    }
    if (!formData.trigger) {
      errors.trigger = 'Policy trigger is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTemplateForm = () => {
    const errors = {};
    if (!templateData.name) {
      errors.name = 'Template name is required';
    }
    if (!templateData.type) {
      errors.type = 'Template type is required';
    }
    if (!templateData.code) {
      errors.code = 'Template code is required';
    }
    setTemplateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreatePolicy = async () => {
    try {
      if (!validatePolicyForm()) {
        return;
      }

      const newPolicy = await createPolicy(formData);

      logAuditEvent(
        'policy_created',
        'policy',
        newPolicy.id.toString(),
        { name: formData.name }
      );

      toaster.create({
        title: 'Policy created',
        description: `Policy "${formData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onPolicyModalClose();
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

  const handleCreateTemplate = async () => {
    try {
      if (!validateTemplateForm()) {
        return;
      }

      const newTemplate = await createTemplate(templateData);

      logAuditEvent(
        'template_created',
        'template',
        newTemplate.id.toString(),
        { name: templateData.name }
      );

      toaster.create({
        title: 'Template created',
        description: `Template "${templateData.name}" has been created.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onTemplateModalClose();
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
      toaster.create({
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
      toaster.create({
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

  if (!hasPermission('policies.manage')) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Access Denied</Heading>
        <Text>You do not have permission to manage automation policies.</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Loading policies...</Heading>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Heading size='lg' mb={4}>Error loading policies</Heading>
        <Box color='red.500'>{error}</Box>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justifyContent='space-between' alignItems='center' mb={6}>
        <Heading as='h1' size='lg'>Automation Policies</Heading>
        <Stack gap={4}>
          <Button
            leftIcon={<FiPlay />}
            colorScheme='green'
            onClick={() => handleBulkExecute(filteredPolicies)}
            isLoading={isExecuting}
            loadingText='Executing...'
          >
            Execute All
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme='brand'
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
            colorScheme='blue'
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
        </Stack>
      </Flex>

      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <FiSearch color='gray.300' />
          </InputLeftElement>
          <Input
            placeholder='Search policies...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            borderRadius='md'
          />
        </InputGroup>
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
        <Flex justify='center' align='center' height='200px'>
          <Spinner size='xl' color='brand.500' />
        </Flex>
      ) : filteredPolicies.length === 0 ? (
        <Box p={5} textAlign='center' borderWidth='1px' borderRadius='md'>
          <Text fontSize='lg'>No policies found</Text>
        </Box>
      ) : (
        <Box borderWidth='1px' borderRadius='lg' overflow='hidden'>
          <Table.Root variant='simple'>
            <Table.Header bg='gray.50'>
              <Table.Row>
                <Table.Cell>Policy</Table.Cell>
                <Table.Cell>Type</Table.Cell>
                <Table.Cell>Trigger</Table.Cell>
                <Table.Cell>Schedule</Table.Cell>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell>Last Executed</Table.Cell>
                <Table.Cell width='100px'>Actions</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredPolicies.map((policy) => (
                <Table.Row key={policy.id}>
                  <Table.Cell>
                    <Stack direction="column" align='start' spacing={1}>
                      <Text fontWeight='medium'>{policy.name}</Text>
                      <Text fontSize='sm' color='gray.500' lineClamp={2}>
                        {policy.description}
                      </Text>
                    </Stack>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme='blue'>{policy.type}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorScheme='purple'>{policy.trigger}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {policy.schedule ? (
                      <Stack>
                        <FiClock />
                        <Text>{policy.schedule}</Text>
                      </Stack>
                    ) : (
                      <Text color='gray.500'>-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorScheme={
                        policy.status === 'success' ? 'green' :
                          policy.status === 'pending' ? 'yellow' :
                            policy.status === 'error' ? 'red' : 'gray'
                      }
                    >
                      {policy.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {policy.lastExecuted ? (
                      <Text>{new Date(policy.lastExecuted).toLocaleString()}</Text>
                    ) : (
                      <Text color='gray.500'>Never</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Menu>
                      <MenuItem
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant='ghost'
                        size='sm'
                        aria-label='Options'
                      />
                      <MenuItemGroup>
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
                        <Separator />
                        <MenuItem
                          icon={<FiTrash2 />}
                          color='red.500'
                          onClick={() => {/* TODO: Implement delete */
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuItemGroup>
                    </Menu>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Policy Modal */}
      <Dialog.Root open={isPolicyModalOpen} onClose={onPolicyModalClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              {selectedPolicy ? 'Edit Policy' : 'Create Policy'}
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Tabs>
                <Tabs.List>
                  <Tabs.Trigger>Basic</Tabs.Trigger>
                  <Tabs.Trigger>Conditions</Tabs.Trigger>
                  <Tabs.Trigger>Actions</Tabs.Trigger>
                  <Tabs.Trigger>Schedule</Tabs.Trigger>
                </Tabs.List>


                <Tabs.Content>
                  <Stack direction="column" gap={4}>
                    <Field.Root required invalid={!!formErrors.name}>
                      <Field.Label>Policy Name</Field.Label>
                      <Input
                        name='name'
                        value={formData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          name: e.target.value,
                        })}
                        placeholder='Enter policy name'
                      />
                      <Field.ErrorText>{formErrors.name}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Description</Field.Label>
                      <Textarea
                        name='description'
                        value={formData.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          description: e.target.value,
                        })}
                        placeholder='Enter policy description'
                      />
                    </Field.Root>

                    <Field.Root required invalid={!!formErrors.type}>
                      <Field.Label>Policy Type</Field.Label>
                      <Select
                        name='type'
                        value={formData.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          type: e.target.value,
                        })}
                      >
                        <option value='repository'>Repository</option>
                        <option value='organization'>Organization</option>
                        <option value='team'>Team</option>
                      </Select>
                      <Field.ErrorText>{formErrors.type}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root required invalid={!!formErrors.trigger}>
                      <Field.Label>Trigger</Field.Label>
                      <Select
                        name='trigger'
                        value={formData.trigger}
                        onChange={(e) => setFormData({
                          ...formData,
                          trigger: e.target.value,
                        })}
                      >
                        <option value='push'>Push</option>
                        <option value='pull_request'>Pull Request</option>
                        <option value='issue'>Issue</option>
                        <option value='schedule'>Schedule</option>
                      </Select>
                      <Field.ErrorText>{formErrors.trigger}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root display='flex' alignItems='center'>
                      <Field.Label mb={0}>Enabled</Field.Label>
                      <Switch.Root
                        name='enabled'
                        checked={formData.enabled}
                        onCheckedChange={(e) => setFormData({
                          ...formData,
                          enabled: e.checked,
                        })}
                      >
                        <Switch.HiddenInput />
                        <Switch.Control />
                        <Switch.Label />
                      </Switch.Root>
                    </Field.Root>
                  </Stack>
                </Tabs.Content>

                <Tabs.Content>
                  <Stack direction="column" gap={4}>
                    {/* TODO: Implement conditions editor */}
                    <Text>Conditions editor will be implemented here</Text>
                  </Stack>
                </Tabs.Content>

                <Tabs.Content>
                  <Stack direction="column" gap={4}>
                    {/* TODO: Implement actions editor */}
                    <Text>Actions editor will be implemented here</Text>
                  </Stack>
                </Tabs.Content>

                <Tabs.Content>
                  <Stack direction="column" gap={4}>
                    <Field.Root>
                      <Field.Label>Cron Schedule</Field.Label>
                      <Input
                        name='schedule'
                        value={formData.schedule || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          schedule: e.target.value,
                        })}
                        placeholder='0 0 * * *'
                      />
                    </Field.Root>
                  </Stack>
                </Tabs.Content>

              </Tabs>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='outline' mr={3} onClick={onPolicyModalClose}>
                Cancel
              </Button>
              <Button colorScheme='brand' onClick={handleCreatePolicy}>
                {selectedPolicy ? 'Save Changes' : 'Create Policy'}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Template Modal */}
      <Dialog.Root open={isTemplateModalOpen} onClose={onTemplateModalClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>Create Template</Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              <Stack direction="column" gap={4}>
                <Field.Root required invalid={!!templateErrors.name}>
                  <Field.Label>Template Name</Field.Label>
                  <Input
                    name='name'
                    value={templateData.name}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      name: e.target.value,
                    })}
                    placeholder='Enter template name'
                  />
                  <Field.ErrorText>{templateErrors.name}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    name='description'
                    value={templateData.description}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      description: e.target.value,
                    })}
                    placeholder='Enter template description'
                  />
                </Field.Root>

                <Field.Root required invalid={!!templateErrors.type}>
                  <Field.Label>Template Type</Field.Label>
                  <Select
                    name='type'
                    value={templateData.type}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      type: e.target.value,
                    })}
                  >
                    <option value='repository'>Repository</option>
                    <option value='organization'>Organization</option>
                    <option value='team'>Team</option>
                  </Select>
                  <Field.ErrorText>{templateErrors.type}</Field.ErrorText>
                </Field.Root>

                <Field.Root required invalid={!!templateErrors.code}>
                  <Field.Label>Code</Field.Label>
                  <Box
                    borderWidth='1px'
                    borderRadius='md'
                    overflow='hidden'
                    position='relative'
                  >
                    <SyntaxHighlighter
                      language='json'
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
                      position='absolute'
                      top={0}
                      left={0}
                      width='100%'
                      height='100%'
                      opacity={0}
                      cursor='text'
                    />
                  </Box>
                  <Field.ErrorText>{templateErrors.code}</Field.ErrorText>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='outline' mr={3} onClick={onTemplateModalClose}>
                Cancel
              </Button>
              <Button colorScheme='brand' onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Execution Results Modal */}
      <Dialog.Root open={isExecuteModalOpen} onClose={onExecuteModalClose} size='xl'>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              Execution Results: {selectedPolicy?.name}
            </Dialog.Header>
            <Dialog.CloseTrigger />
            <Dialog.Body>
              {executionResults
                .filter(result => result.policyId === selectedPolicy?.id)
                .map((result, index) => (
                  <Box key={index} mb={4}>
                    <Stack mb={2}>
                      <Badge
                        colorScheme={
                          result.status === 'success' ? 'green' :
                            result.status === 'pending' ? 'yellow' :
                              result.status === 'error' ? 'red' : 'gray'
                        }
                      >
                        {result.status}
                      </Badge>
                      <Text fontSize='sm' color='gray.500'>
                        {new Date(result.timestamp).toLocaleString()}
                      </Text>
                    </Stack>

                    <Box
                      borderWidth='1px'
                      borderRadius='md'
                      p={4}
                      bg='gray.50'
                    >
                      <Stack direction="column" align='stretch' spacing={2}>
                        {result.details.results.map((action, actionIndex) => (
                          <Stack key={actionIndex}>
                            {action.status === 'success' ? (
                              <FiCheckCircle color='green' />
                            ) : (
                              <FiAlertCircle color='red' />
                            )}
                            <Text>{action.message}</Text>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                ))}
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={onExecuteModalClose}>Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default AutomationPoliciesPage;
