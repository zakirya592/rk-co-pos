import React from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from '@nextui-org/react';

const ViewUserDetails = ({ isOpen, onClose, user }) => {
    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader>User Details</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700">Name</h4>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">Email</h4>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">Role</h4>
                            <Chip color={user.role === 'admin' ? 'secondary' : 'primary'}>
                                {user.role}
                            </Chip>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onPress={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

    );
};

export default ViewUserDetails;