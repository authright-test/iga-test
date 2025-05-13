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
  IconButton,
  useToast,
  Spinner,
  Text,
  HStack,
  VStack,
  Textarea,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Switch,
  Grid,
  GridItem,
  Divider,
  Tag,
  Tooltip,
  useColorModeValue,
  Select,
  List,
  ListItem,
  ListIcon,
  Checkbox,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiMoreVertical, 
  FiShield, 
  FiCheck,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedPermissions: []
  });
  const toast = useToast();
  const { token, organization, logAuditEvent } = useAuth();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 获取角色和权限列表
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [organization?.id]);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!organization?.id) {
        // 使用模拟数据
        const mockRoles = [
          { 
            id: 1, 
            name: 'Admin', 
            description: 'Full administrative access', 
            userCount: 3,
            isBuiltIn: true,
            permissions: [
              'repo:read', 'repo:write', 'repo:admin', 'user:read', 'user:write', 'user:admin', 
              'org:read', 'org:write', 'org:admin', 'team:read', 'team:write', 'team:admin',
              'settings:read', 'settings:write'
            ]
          },
          { 
            id: 2, 
            name: 'Developer', 
            description: 'Repository contributor access', 
            userCount: 12,
            isBuiltIn: true,
            permissions: [
              'repo:read', 'repo:write', 'org:read', 'team:read', 'user:read'
            ]
          },
          { 
            id: 3, 
            name: 'Viewer', 
            description: 'Read-only access', 
            userCount: 8,
            isBuiltIn: true,
            permissions: [
              'repo:read', 'org:read', 'team:read', 'user:read'
            ]
          },
          { 
            id: 4, 
            name: 'Team Lead', 
            description: 'Team management with repository access', 
            userCount: 5,
            isBuiltIn: false,
            permissions: [
              'repo:read', 'repo:write', 'team:read', 'team:write', 'user:read', 'org:read'
            ]
          },
          { 
            id: 5, 
            name: 'Compliance Officer', 
            description: 'Compliance and audit access', 
            userCount: 2,
            isBuiltIn: false,
            permissions: [
              'repo:read', 'user:read', 'org:read', 'team:read', 'audit:read'
            ]
          },
        ];
        
        setRoles(mockRoles);
        return;
      }
      
      // 获取真实数据
      const response = await axios.get(`/api/organizations/${organization.id}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(response.data);
    } catch (err) {
      setError('Failed to fetch roles: ' + (err.response?.data?.error || err.message));
      toast({
        title: 'Error fetching roles',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      if (!organization?.id) {
        // 使用模拟数据
        const mockPermissions = [
          { id: 1, name: 'repo:read', description: 'Read access to repositories' },
          { id: 2, name: 'repo:write', description: 'Write access to repositories' },
          { id: 3, name: 'repo:admin', description: 'Admin access to repositories' },
          { id: 4, name: 'user:read', description: 'Read access to users' },
          { id: 5, name: 'user:write', description: 'Write access to users' },
          { id: 6, name: 'user:admin', description: 'Admin access to users' },
          { id: 7, name: 'org:read', description: 'Read access to organization' },
          { id: 8, name: 'org:write', description: 'Write access to organization' },
          { id: 9, name: 'org:admin', description: 'Admin access to organization' },
          { id: 10, name: 'team:read', description: 'Read access to teams' },
          { id: 11, name: 'team:write', description: 'Write access to teams' },
          { id: 12, name: 'team:admin', description: 'Admin access to teams' },
          { id: 13, name: 'settings:read', description: 'Read access to settings' },
          { id: 14, name: 'settings:write', description: 'Write access to settings' },
          { id: 15, name: 'audit:read', description: 'Read access to audit logs' },
        ];
        
        setPermissions(mockPermissions);
        return;
      }
      
      // 获取真实数据
      const response = await axios.get(`/api/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPermissions(response.data);
    } catch (err) {
      toast({
        title: 'Error fetching permissions',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 处理权限选择变化
  const handlePermissionChange = (permissionName) => {
    const selectedPermissions = [...formData.selectedPermissions];
    
    if (selectedPermissions.includes(permissionName)) {
      // 移除权限
      const index = selectedPermissions.indexOf(permissionName);
      selectedPermissions.splice(index, 1);
    } else {
      // 添加权限
      selectedPermissions.push(permissionName);
    }
    
    setFormData({ ...formData, selectedPermissions });
  };

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 新建角色
  const handleCreateRole = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      selectedPermissions: []
    });
    onRoleModalOpen();
  };

  // 编辑角色
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      selectedPermissions: role.permissions || []
    });
    onRoleModalOpen();
  };

  // 保存角色
  const handleSaveRole = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Role name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (formData.selectedPermissions.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one permission must be selected',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!organization?.id) {
        // 模拟保存
        if (selectedRole) {
          // 编辑现有角色
          const updatedRoles = roles.map(role => {
            if (role.id === selectedRole.id) {
              return {
                ...role,
                name: formData.name,
                description: formData.description,
                permissions: formData.selectedPermissions
              };
            }
            return role;
          });
          
          setRoles(updatedRoles);
          
          toast({
            title: 'Role updated',
            description: `Role "${formData.name}" has been updated.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          // 创建新角色
          const newRole = {
            id: Date.now(), // 使用时间戳作为临时ID
            name: formData.name,
            description: formData.description,
            permissions: formData.selectedPermissions,
            userCount: 0,
            isBuiltIn: false
          };
          
          setRoles([...roles, newRole]);
          
          toast({
            title: 'Role created',
            description: `Role "${formData.name}" has been created.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
        
        onRoleModalClose();
        return;
      }
      
      // 实际保存
      if (selectedRole) {
        // 编辑现有角色
        await axios.put(`/api/organizations/${organization.id}/roles/${selectedRole.id}`, 
          { 
            name: formData.name,
            description: formData.description,
            permissions: formData.selectedPermissions
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 记录审计日志
        logAuditEvent(
          'role_updated',
          'role',
          selectedRole.id.toString(),
          { 
            roleName: formData.name,
            previousName: selectedRole.name,
            permissions: formData.selectedPermissions
          }
        );
        
        toast({
          title: 'Role updated',
          description: `Role "${formData.name}" has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // 创建新角色
        await axios.post(`/api/organizations/${organization.id}/roles`, 
          { 
            name: formData.name,
            description: formData.description,
            permissions: formData.selectedPermissions
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 记录审计日志
        logAuditEvent(
          'role_created',
          'role',
          formData.name,
          { 
            roleName: formData.name,
            permissions: formData.selectedPermissions
          }
        );
        
        toast({
          title: 'Role created',
          description: `Role "${formData.name}" has been created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onRoleModalClose();
      fetchRoles(); // 刷新角色列表
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

  // 打开删除角色模态框
  const handleDeleteClick = (role) => {
    setSelectedRole(role);
    onDeleteModalOpen();
  };

  // 删除角色
  const handleDeleteRole = async () => {
    try {
      if (selectedRole.isBuiltIn) {
        toast({
          title: 'Cannot Delete Built-in Role',
          description: 'Built-in roles cannot be deleted.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        onDeleteModalClose();
        return;
      }

      if (selectedRole.userCount > 0) {
        toast({
          title: 'Cannot Delete Role',
          description: `This role is currently assigned to ${selectedRole.userCount} users. Please reassign these users before deleting the role.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        onDeleteModalClose();
        return;
      }

      if (!organization?.id) {
        // 模拟删除
        const updatedRoles = roles.filter(role => role.id !== selectedRole.id);
        setRoles(updatedRoles);
        
        toast({
          title: 'Role deleted',
          description: `Role "${selectedRole.name}" has been deleted.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onDeleteModalClose();
        return;
      }
      
      // 实际删除
      await axios.delete(`/api/organizations/${organization.id}/roles/${selectedRole.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 记录审计日志
      logAuditEvent(
        'role_deleted',
        'role',
        selectedRole.id.toString(),
        { 
          roleName: selectedRole.name
        }
      );
      
      toast({
        title: 'Role deleted',
        description: `Role "${selectedRole.name}" has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteModalClose();
      fetchRoles(); // 刷新角色列表
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

  // 过滤角色列表
  const filteredRoles = roles.filter(role => {
    const searchLower = searchTerm.toLowerCase();
    return (
      role.name?.toLowerCase().includes(searchLower) ||
      role.description?.toLowerCase().includes(searchLower)
    );
  });

  // 分组权限列表
  const groupedPermissions = permissions.reduce((groups, permission) => {
    const [resource] = permission.name.split(':');
    if (!groups[resource]) {
      groups[resource] = [];
    }
    groups[resource].push(permission);
    return groups;
  }, {});

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Roles & Permissions</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreateRole}>
          Create Role
        </Button>
      </Flex>
      
      {/* Search bar */}
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={handleSearchChange}
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
      ) : filteredRoles.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" mb={4}>No roles found</Text>
          <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={handleCreateRole}>
            Create Role
          </Button>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name</Th>
                <Th>Description</Th>
                <Th>Users</Th>
                <Th>Permissions</Th>
                <Th>Type</Th>
                <Th width="60px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRoles.map((role) => (
                <Tr key={role.id}>
                  <Td fontWeight="medium">{role.name}</Td>
                  <Td>{role.description}</Td>
                  <Td>
                    <Badge colorScheme={role.userCount > 0 ? 'blue' : 'gray'}>
                      {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1} wrap="wrap">
                      {role.permissions.slice(0, 3).map((permission, index) => (
                        <Tag size="sm" key={index} colorScheme={getPermissionColor(permission)}>
                          {permission.split(':')[1] || permission}
                        </Tag>
                      ))}
                      {role.permissions.length > 3 && (
                        <Tooltip 
                          label={role.permissions.slice(3).join(', ')} 
                          placement="top"
                          hasArrow
                        >
                          <Tag size="sm" colorScheme="gray">+{role.permissions.length - 3}</Tag>
                        </Tooltip>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={role.isBuiltIn ? 'purple' : 'green'}>
                      {role.isBuiltIn ? 'Built-in' : 'Custom'}
                    </Badge>
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
                          icon={<FiEdit />} 
                          onClick={() => handleEditRole(role)}
                          isDisabled={role.isBuiltIn}
                        >
                          Edit Role
                        </MenuItem>
                        <MenuItem 
                          icon={<FiShield />} 
                          onClick={() => handleEditRole(role)}
                        >
                          View Permissions
                        </MenuItem>
                        <MenuItem 
                          icon={<FiTrash2 />} 
                          onClick={() => handleDeleteClick(role)}
                          color="red.500"
                          isDisabled={role.isBuiltIn || role.userCount > 0}
                        >
                          Delete Role
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
      
      {/* Role Modal (Create/Edit) */}
      <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="name" mb={4} isRequired>
              <FormLabel>Role Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter role name"
                isDisabled={selectedRole?.isBuiltIn}
              />
            </FormControl>
            
            <FormControl id="description" mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose of this role"
                isDisabled={selectedRole?.isBuiltIn}
              />
            </FormControl>
            
            <FormControl id="permissions" mb={4} isRequired>
              <FormLabel>Permissions</FormLabel>
              <Box
                borderWidth="1px"
                borderRadius="md"
                p={4}
                maxHeight="300px"
                overflowY="auto"
                borderColor={borderColor}
              >
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <Box key={resource} mb={4}>
                    <Text fontWeight="bold" mb={2} textTransform="capitalize">
                      {resource}
                    </Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {perms.map(permission => (
                        <Checkbox
                          key={permission.id}
                          isChecked={formData.selectedPermissions.includes(permission.name)}
                          onChange={() => handlePermissionChange(permission.name)}
                          isDisabled={selectedRole?.isBuiltIn}
                        >
                          <HStack>
                            <Text>{permission.name.split(':')[1]}</Text>
                            <Tooltip label={permission.description} hasArrow placement="top">
                              <Box as={FiInfo} size="16px" color="gray.500" />
                            </Tooltip>
                          </HStack>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                    {Object.entries(groupedPermissions).indexOf([resource, perms]) !== 
                      Object.entries(groupedPermissions).length - 1 && (
                      <Divider my={3} />
                    )}
                  </Box>
                ))}
              </Box>
            </FormControl>
            
            {selectedRole?.isBuiltIn && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Built-in roles cannot be modified. You can view the permissions but cannot change them.
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onRoleModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleSaveRole}
              isDisabled={selectedRole?.isBuiltIn}
            >
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Delete Role Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be undone.
            </Text>
            {selectedRole?.userCount > 0 && (
              <Alert status="warning" mt={4}>
                <AlertIcon />
                This role is currently assigned to {selectedRole.userCount} users. Please reassign these users before deleting the role.
              </Alert>
            )}
            {selectedRole?.isBuiltIn && (
              <Alert status="error" mt={4}>
                <AlertIcon />
                Built-in roles cannot be deleted.
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDeleteRole}
              isDisabled={selectedRole?.isBuiltIn || selectedRole?.userCount > 0}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// 根据权限名获取合适的颜色
const getPermissionColor = (permissionName) => {
  if (!permissionName) return 'gray';
  
  const [resource, action] = permissionName.split(':');
  
  if (action === 'admin') return 'red';
  if (action === 'write') return 'orange';
  if (action === 'read') return 'green';
  
  switch (resource) {
    case 'repo':
      return 'blue';
    case 'org':
      return 'purple';
    case 'team':
      return 'cyan';
    case 'user':
      return 'teal';
    case 'settings':
      return 'yellow';
    case 'audit':
      return 'pink';
    default:
      return 'gray';
  }
};

export default RolesPage; 