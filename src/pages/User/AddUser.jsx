import React, { useState } from 'react';
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
import { FaUser, FaEnvelope, FaIdBadge, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

const AddUser = ({
  isOpen,
  onClose,
  onAdd,
  newUser,
  setNewUser,
  handleAddProduct,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wrap the add handler to set loading
  const handleAdd = async () => {
    setLoading(true);
    await handleAddProduct();
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} size="md">
      <ModalContent>
        <ModalHeader>Add New User</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="User Name"
              placeholder="Enter user name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              startContent={<FaUser />}
              variant="bordered"
              required
            />
            <Input
              label="Email"
              placeholder="user@example.com"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              startContent={<FaEnvelope />}
              variant="bordered"
              required
            />
            <Input
              label="Password"
              placeholder="Enter password"
              type={showPassword ? "text" : "password"}
              value={newUser.password || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              startContent={<FaLock />}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              }
              variant="bordered"
              required
            />
            <Select
              placeholder="Select Role"
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              startContent={<FaIdBadge />}
              variant="bordered"
              required
            >
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
            onPress={handleAdd}
            isLoading={loading}
          >
            Add User
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddUser;