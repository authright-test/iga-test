import { Button, Input, Select, Stack, } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

export const UserForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        role: initialData.role || 'user',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        role: 'user',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog.Root open={isOpen} onClose={onClose}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            {initialData ? 'Edit User' : 'Create User'}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body pb={6}>
            <form onSubmit={handleSubmit}>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.username} required>
                  <Field.Label>Username</Field.Label>
                  <Input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder='Enter username'
                  />
                  <Field.ErrorText>{errors.username}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email} required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder='Enter email'
                    type='email'
                  />
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Role</Field.Label>
                  <Select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value='user'>User</option>
                    <option value='admin'>Admin</option>
                  </Select>
                </Field.Root>

                <Stack direction='row' spacing={4} justify='flex-end'>
                  <Button onClick={onClose}>Cancel</Button>
                  <Button type='submit' colorScheme='blue'>
                    {initialData ? 'Update' : 'Create'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
