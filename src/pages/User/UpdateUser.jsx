import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button
} from '@nextui-org/react';
import { FaUser, FaEnvelope, FaIdBadge } from 'react-icons/fa';

const UpdateUser = ({
  isOpen,
  onClose,
  handleUpdateuser,
  user,
  updatedUser,
  setUpdatedUser,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="md">
    <ModalContent>
      <ModalHeader>Update User</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="User Name"
            placeholder="Enter user name"
            value={updatedUser.name}
            onChange={(e) =>
              setUpdatedUser({ ...updatedUser, name: e.target.value })
            }
            startContent={<FaUser />}
            variant="bordered"
            required
          />
          <Input
            label="Email"
            placeholder="user@example.com"
            type="email"
            value={updatedUser.email}
            onChange={(e) =>
              setUpdatedUser({ ...updatedUser, email: e.target.value })
            }
            startContent={<FaEnvelope />}
            variant="bordered"
            required
          />
          <Select
            label="Role"
            value={updatedUser.role}
            onChange={(e) =>
              setUpdatedUser({ ...updatedUser, role: e.target.value })
            }
            startContent={<FaIdBadge />}
            variant="bordered"
            required
          >
            <SelectItem key="" value="" isDisabled isSelected>
              Select Role
            </SelectItem>
            <SelectItem key="admin" value="admin">
              Admin
            </SelectItem>
            <SelectItem key="user" value="user">
              User
            </SelectItem>
          </Select>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onPress={handleUpdateuser}
        >
          Update User
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default UpdateUser;