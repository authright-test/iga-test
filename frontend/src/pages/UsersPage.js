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
  Select,
  InputGroup,
  InputLeftElement,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Tag,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiMoreVertical, 
  FiUserPlus, 
  FiSend, 
  FiShield, 
  FiLink,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isInviteModalOpen, onOpen: onInviteModalOpen, onClose: onInviteModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const [formData, setFormData] = useState({ email: '', role: '' });
  const toast = useToast();
  const { token, organization, logAuditEvent } = useAuth();

  // 获取用户和角色列表
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [organization?.id]);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!organization?.id) {
        // 使用模拟数据
        const mockUsers = [
          {
            id: 1,
            githubId: '12345',
            username: 'johndoe',
            email: 'john.doe@example.com',
            name: 'John Doe',
            avatarUrl: 'https://via.placeholder.com/150',
            role: { id: 1, name: 'Admin' },
            isActive: true,
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            githubId: '23456',
            username: 'janedoe',
            email: 'jane.doe@example.com',
            name: 'Jane Doe',
            avatarUrl: 'https://via.placeholder.com/150',
            role: { id: 2, name: 'Developer' },
            isActive: true,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            githubId: '34567',
            username: 'alice',
            email: 'alice@example.com',
            name: 'Alice Smith',
            avatarUrl: 'https://via.placeholder.com/150',
            role: { id: 3, name: 'Viewer' },
            isActive: false,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 4,
            githubId: '45678',
            username: 'bob',
            email: 'bob@example.com',
            name: 'Bob Johnson',
            avatarUrl: 'https://via.placeholder.com/150',
            role: { id: 2, name: 'Developer' },
            isActive: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 5,
            githubId: '56789',
            username: 'charlie',
            email: 'charlie@example.com',
            name: 'Charlie Brown',
            avatarUrl: 'https://via.placeholder.com/150',
            role: { id: 4, name: 'Manager' },
            isActive: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
        
        setUsers(mockUsers);
        return;
      }
      
      // 获取真实数据
      const response = await axios.get(`/api/organizations/${organization.id}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users: ' + (err.response?.data?.error || err.message));
      toast({
        title: 'Error fetching users',
        description: err.response?.data?.error || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      if (!organization?.id) {
        // 使用模拟数据
        const mockRoles = [
          { id: 1, name: 'Admin', description: 'Full administrative access' },
          { id: 2, name: 'Developer', description: 'Repository contributor access' },
          { id: 3, name: 'Viewer', description: 'Read-only access' },
          { id: 4, name: 'Manager', description: 'Team management access' },
        ];
        
        setRoles(mockRoles);
        return;
      }
      
      // 获取真实数据
      const response = await axios.get(`/api/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(response.data);
    } catch (err) {
      toast({
        title: 'Error fetching roles',
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

  // 处理搜索输入变化
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 打开编辑用户模态框
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      role: user.role?.id || '',
    });
    onUserModalOpen();
  };

  // 打开删除用户模态框
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    onDeleteModalOpen();
  };

  // 保存用户更改
  const handleSaveUser = async () => {
    try {
      if (!formData.role) {
        toast({
          title: 'Validation Error',
          description: 'Please select a role',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!organization?.id) {
        // 模拟更新
        const roleObj = roles.find(r => r.id.toString() === formData.role.toString());
        
        const updatedUsers = users.map(user => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              email: formData.email,
              role: roleObj,
            };
          }
          return user;
        });
        
        setUsers(updatedUsers);
        
        toast({
          title: 'User updated',
          description: `User "${selectedUser.username}" has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onUserModalClose();
        return;
      }
      
      // 实际更新
      await axios.put(`/api/organizations/${organization.id}/users/${selectedUser.id}`, 
        { email: formData.email, roleId: formData.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 记录审计日志
      logAuditEvent(
        'user_updated',
        'user',
        selectedUser.id.toString(),
        { 
          username: selectedUser.username,
          newRoleId: formData.role,
          previousRoleId: selectedUser.role?.id
        }
      );
      
      toast({
        title: 'User updated',
        description: `User "${selectedUser.username}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUserModalClose();
      fetchUsers(); // 刷新用户列表
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

  // 处理邀请输入变化
  const handleInviteEmailChange = (e) => {
    setInviteEmail(e.target.value);
  };

  // 处理邀请角色变化
  const handleInviteRoleChange = (e) => {
    setInviteRole(e.target.value);
  };

  // 发送邀请
  const handleSendInvite = async () => {
    try {
      if (!inviteEmail) {
        toast({
          title: 'Validation Error',
          description: 'Email is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!inviteRole) {
        toast({
          title: 'Validation Error',
          description: 'Please select a role',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!organization?.id) {
        // 模拟邀请
        toast({
          title: 'Invitation sent',
          description: `An invitation has been sent to ${inviteEmail}.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onInviteModalClose();
        setInviteEmail('');
        setInviteRole('');
        return;
      }
      
      // 实际邀请
      await axios.post(`/api/organizations/${organization.id}/invitations`, 
        { email: inviteEmail, roleId: inviteRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // 记录审计日志
      logAuditEvent(
        'user_invited',
        'invitation',
        inviteEmail,
        { 
          email: inviteEmail,
          roleId: inviteRole,
        }
      );
      
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${inviteEmail}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onInviteModalClose();
      setInviteEmail('');
      setInviteRole('');
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

  // 移除用户
  const handleRemoveUser = async () => {
    try {
      if (!organization?.id) {
        // 模拟移除
        const updatedUsers = users.filter(user => user.id !== selectedUser.id);
        setUsers(updatedUsers);
        
        toast({
          title: 'User removed',
          description: `User "${selectedUser.username}" has been removed.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onDeleteModalClose();
        return;
      }
      
      // 实际移除
      await axios.delete(`/api/organizations/${organization.id}/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 记录审计日志
      logAuditEvent(
        'user_removed',
        'user',
        selectedUser.id.toString(),
        { 
          username: selectedUser.username,
          email: selectedUser.email
        }
      );
      
      toast({
        title: 'User removed',
        description: `User "${selectedUser.username}" has been removed from the organization.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteModalClose();
      fetchUsers(); // 刷新用户列表
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

  // 过滤用户列表
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Users</Heading>
        <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onInviteModalOpen}>
          Invite User
        </Button>
      </Flex>
      
      {/* Search bar */}
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search users..."
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
      ) : filteredUsers.length === 0 ? (
        <Box p={5} textAlign="center" borderWidth="1px" borderRadius="md">
          <Text fontSize="lg" mb={4}>No users found</Text>
          <Button leftIcon={<FiUserPlus />} colorScheme="brand" onClick={onInviteModalOpen}>
            Invite User
          </Button>
        </Box>
      ) : (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th width="60px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.id}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={user.name} src={user.avatarUrl} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{user.name}</Text>
                        <Text fontSize="sm" color="gray.500">@{user.username}</Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge colorScheme={getRoleColor(user.role?.name)}>
                      {user.role?.name || 'No Role'}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={user.isActive ? 'green' : 'red'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
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
                          onClick={() => handleEditUser(user)}
                        >
                          Edit User
                        </MenuItem>
                        <MenuItem 
                          icon={<FiShield />} 
                          onClick={() => {
                            handleEditUser(user);
                          }}
                        >
                          Change Role
                        </MenuItem>
                        <MenuItem 
                          icon={<FiTrash2 />} 
                          onClick={() => handleDeleteClick(user)}
                          color="red.500"
                        >
                          Remove from Organization
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
      
      {/* Edit User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit User: {selectedUser?.username}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="email" mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </FormControl>
            
            <FormControl id="role" mb={4}>
              <FormLabel>Role</FormLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="Select role"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onUserModalClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSaveUser}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Invite User Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={onInviteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="inviteEmail" isRequired mb={4}>
              <FormLabel>Email Address</FormLabel>
              <Input
                value={inviteEmail}
                onChange={handleInviteEmailChange}
                placeholder="Enter email"
              />
            </FormControl>
            
            <FormControl id="inviteRole" isRequired mb={4}>
              <FormLabel>Role</FormLabel>
              <Select
                value={inviteRole}
                onChange={handleInviteRoleChange}
                placeholder="Select role"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onInviteModalClose}>
              Cancel
            </Button>
            <Button leftIcon={<FiSend />} colorScheme="brand" onClick={handleSendInvite}>
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Remove User Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to remove "{selectedUser?.name || selectedUser?.username}" from the organization? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleRemoveUser}>
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// 根据角色名获取合适的颜色
const getRoleColor = (roleName) => {
  if (!roleName) return 'gray';
  
  const roleLower = roleName.toLowerCase();
  
  if (roleLower.includes('admin')) return 'red';
  if (roleLower.includes('owner')) return 'purple';
  if (roleLower.includes('manager')) return 'orange';
  if (roleLower.includes('dev')) return 'blue';
  if (roleLower.includes('viewer') || roleLower.includes('read')) return 'green';
  
  return 'gray';
};

export default UsersPage; 