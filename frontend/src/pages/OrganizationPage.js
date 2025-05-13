import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Avatar,
  useColorModeValue,
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
  Textarea,
  Stack,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tag,
  HStack,
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiUsers, 
  FiGitBranch, 
  FiShield, 
  FiList, 
  FiMail, 
  FiGlobe, 
  FiClock,
  FiInfo,
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const OrganizationPage = () => {
  const { organization, token, logAuditEvent } = useAuth();
  const [orgDetails, setOrgDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    website: '',
    location: '',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // 获取组织详细信息
  const fetchOrganizationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!organization?.id) {
        // 如果没有组织信息，使用模拟数据
        const mockOrgDetails = {
          id: 1,
          githubId: '12345',
          name: 'Sample Organization',
          login: 'sample-org',
          description: 'This is a sample organization for demonstration purposes.',
          email: 'admin@sample-org.com',
          website: 'https://sample-org.com',
          avatarUrl: 'https://via.placeholder.com/100',
          location: 'San Francisco, CA',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          stats: {
            members: 45,
            repositories: 78,
            teams: 12,
            policies: 8,
          }
        };
        
        setOrgDetails(mockOrgDetails);
        setFormData({
          name: mockOrgDetails.name,
          description: mockOrgDetails.description || '',
          email: mockOrgDetails.email || '',
          website: mockOrgDetails.website || '',
          location: mockOrgDetails.location || '',
        });
        return;
      }
      
      // 获取真实组织数据
      const response = await axios.get(`/api/organizations/${organization.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrgDetails(response.data);
      
      // 设置表单数据
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        email: response.data.email || '',
        website: response.data.website || '',
        location: response.data.location || '',
      });
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Failed to load organization details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 页面加载时获取组织数据
  useEffect(() => {
    fetchOrganizationDetails();
  }, [organization?.id]);
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // 提交组织信息更新
  const handleUpdateOrganization = async () => {
    try {
      if (!formData.name) {
        toast({
          title: 'Validation Error',
          description: 'Organization name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      if (!organization?.id) {
        toast({
          title: 'Demo Mode',
          description: 'Organization information would be updated in a real implementation',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        
        // 更新本地状态以模拟更新
        const updatedOrgDetails = {
          ...orgDetails,
          name: formData.name,
          description: formData.description,
          email: formData.email,
          website: formData.website,
          location: formData.location,
          updatedAt: new Date().toISOString(),
        };
        
        setOrgDetails(updatedOrgDetails);
        onClose();
        return;
      }
      
      // 更新组织信息
      const response = await axios.put(`/api/organizations/${organization.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrgDetails(response.data);
      
      // 记录审计日志
      logAuditEvent(
        'organization_updated',
        'organization',
        organization.id.toString(),
        { 
          updatedFields: Object.keys(formData).filter(key => 
            formData[key] !== (orgDetails[key] || '')
          ) 
        }
      );
      
      toast({
        title: 'Organization Updated',
        description: 'Organization information has been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
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
  
  // 计算组织的活跃时间
  const getOrganizationAge = () => {
    if (!orgDetails?.createdAt) return 'N/A';
    
    const createdDate = new Date(orgDetails.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) {
      return `${diffInDays} days`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffInDays / 365);
      const remainingMonths = Math.floor((diffInDays % 365) / 30);
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" mb={4} borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading as="h1" size="lg">Organization</Heading>
        <Button leftIcon={<FiEdit />} colorScheme="brand" onClick={onOpen}>
          Edit Organization
        </Button>
      </Flex>
      
      {/* Organization Profile Card */}
      <Card mb={8} borderRadius="lg" boxShadow="sm">
        <CardHeader>
          <Flex>
            <Avatar 
              size="xl" 
              src={orgDetails?.avatarUrl || 'https://via.placeholder.com/100'} 
              name={orgDetails?.name} 
              mr={6}
              bg="brand.500"
            />
            <Box>
              <Heading size="lg" mb={2}>{orgDetails?.name}</Heading>
              <HStack spacing={2} mb={2}>
                <Tag colorScheme="brand">{orgDetails?.login}</Tag>
                {orgDetails?.isEnterprise && <Tag colorScheme="purple">Enterprise</Tag>}
              </HStack>
              <Text color="gray.600">{orgDetails?.description || 'No description available'}</Text>
            </Box>
          </Flex>
        </CardHeader>
        
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Stack spacing={4}>
              <Heading size="md" mb={2}>Organization Details</Heading>
              
              <Flex align="center">
                <Icon as={FiMail} mr={2} color="gray.500" />
                <Text>{orgDetails?.email || 'No email available'}</Text>
              </Flex>
              
              <Flex align="center">
                <Icon as={FiGlobe} mr={2} color="gray.500" />
                <Text>{orgDetails?.website || 'No website available'}</Text>
              </Flex>
              
              <Flex align="center">
                <Icon as={FiInfo} mr={2} color="gray.500" />
                <Text>{orgDetails?.location || 'No location available'}</Text>
              </Flex>
              
              <Flex align="center">
                <Icon as={FiClock} mr={2} color="gray.500" />
                <Text>Active for {getOrganizationAge()}</Text>
              </Flex>
            </Stack>
            
            <Stack spacing={4}>
              <Heading size="md" mb={2}>Organization Statistics</Heading>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Members</StatLabel>
                  <StatNumber>{orgDetails?.stats?.members || 0}</StatNumber>
                  <StatHelpText>Total organization members</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Teams</StatLabel>
                  <StatNumber>{orgDetails?.stats?.teams || 0}</StatNumber>
                  <StatHelpText>Organization teams</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Repositories</StatLabel>
                  <StatNumber>{orgDetails?.stats?.repositories || 0}</StatNumber>
                  <StatHelpText>Managed repositories</StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Policies</StatLabel>
                  <StatNumber>{orgDetails?.stats?.policies || 0}</StatNumber>
                  <StatHelpText>Active policies</StatHelpText>
                </Stat>
              </SimpleGrid>
            </Stack>
          </SimpleGrid>
        </CardBody>
        
        <CardFooter>
          <Text fontSize="sm" color="gray.500">
            Last updated: {new Date(orgDetails?.updatedAt).toLocaleString()}
          </Text>
        </CardFooter>
      </Card>
      
      {/* Key Resources Section */}
      <Heading size="md" mb={4}>Key Resources</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={6}>
        <ResourceCard
          icon={FiUsers}
          title="Users"
          description="Manage organization members and their access"
          linkTo="/users"
          iconColor="blue.500"
        />
        
        <ResourceCard
          icon={FiUsers}
          title="Teams"
          description="Manage organization teams and permissions"
          linkTo="/teams"
          iconColor="green.500"
        />
        
        <ResourceCard
          icon={FiGitBranch}
          title="Repositories"
          description="Manage organization repositories"
          linkTo="/repositories"
          iconColor="purple.500"
        />
        
        <ResourceCard
          icon={FiShield}
          title="Roles"
          description="Configure role-based access control"
          linkTo="/roles"
          iconColor="orange.500"
        />
        
        <ResourceCard
          icon={FiList}
          title="Policies"
          description="Manage access policies and enforcement"
          linkTo="/policies"
          iconColor="cyan.500"
        />
      </SimpleGrid>
      
      {/* Organization Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Organization</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="name" isRequired mb={4}>
              <FormLabel>Organization Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter organization name"
              />
            </FormControl>
            
            <FormControl id="description" mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter organization description"
              />
            </FormControl>
            
            <FormControl id="email" mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter organization email"
              />
            </FormControl>
            
            <FormControl id="website" mb={4}>
              <FormLabel>Website</FormLabel>
              <Input
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="Enter organization website"
              />
            </FormControl>
            
            <FormControl id="location" mb={4}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter organization location"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleUpdateOrganization}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Resource Card Component
const ResourceCard = ({ icon, title, description, linkTo, iconColor = 'brand.500' }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  
  return (
    <Card
      as="a"
      href={linkTo}
      borderRadius="lg"
      boxShadow="sm"
      p={4}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      height="100%"
      bg={bgColor}
      cursor="pointer"
    >
      <Flex direction="column" align="center" textAlign="center">
        <Icon as={icon} boxSize={10} color={iconColor} mb={3} />
        <Heading size="md" mb={2}>{title}</Heading>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </Flex>
    </Card>
  );
};

export default OrganizationPage; 