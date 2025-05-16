import { Box, Dialog, IconButton, useDisclosure, } from '@chakra-ui/react';
import React from 'react';
import { FiMenu } from 'react-icons/fi';
import SidebarContent from './SidebarContent';

const MobileNav = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      ml={{ base: 0, md: 60 }}
      px='4'
      position='sticky'
      top='0'
      height='20'
      zIndex='1'
      borderBottomWidth='1px'

      display={{ base: 'flex', md: 'none' }}
      alignItems='center'
    >
      <IconButton
        variant='outline'
        onClick={onOpen}
        aria-label='open menu'
        icon={<FiMenu />}
      />

      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <SidebarContent onClose={onClose} />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default MobileNav;
