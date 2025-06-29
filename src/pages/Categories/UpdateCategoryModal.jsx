import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Spinner } from '@nextui-org/react';

const UpdateCategoryModal = ({
  isOpen,
  onClose,
  editCategory,
  seteditCategory,
  onUpdateCategory
}) => {
  const [loading, setLoading] = useState(false);

  // Wrap the update handler to set loading
  const handleUpdate = async () => {
    setLoading(true);
    await onUpdateCategory();
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>Edit Category</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={editCategory.name}
              onChange={(e) =>
                seteditCategory({ ...editCategory, name: e.target.value })
              }
              variant="bordered"
              required
            />
            <Input
              label="Description"
              placeholder="Enter category description"
              value={editCategory.description}
              onChange={(e) =>
                seteditCategory({
                  ...editCategory,
                  description: e.target.value,
                })
              }
              variant="bordered"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleUpdate}
            isLoading={loading}
            disabled={loading}
          >
            Update Category
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCategoryModal;