import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Spinner } from '@nextui-org/react';

const AddCategoryModal = ({
  isOpen,
  onClose,
  newCategory,
  setNewCategory,
  onAddCategory
}) => {
  const [loading, setLoading] = useState(false);

  // Handle Enter key: move to next field, or submit on last
  const handleEnterKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const form = e.target.closest('form') || e.target.closest('[role="dialog"]');
    if (!form) return;

    const elements = Array.from(form.querySelectorAll('input, select, textarea')).filter(
      (el) =>
        !el.disabled &&
        el.type !== "hidden" &&
        el.tabIndex !== -1 &&
        typeof el.focus === "function"
    );

    const index = elements.indexOf(e.target);
    if (index === -1) return;

    const next = elements[index + 1];
    if (next) {
      next.focus();
    } else {
      // Last field: trigger submit button
      const submitButton = form.querySelector('button[class*="bg-gradient"]');
      if (submitButton && !loading) {
        submitButton.click();
      }
    }
  };

  // Wrap the add handler to set loading
  const handleAdd = async () => {
    setLoading(true);
    await onAddCategory();
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
        <ModalHeader>Add New Category</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              onKeyDown={handleEnterKey}
              variant="bordered"
              required
            />
            <Input
              label="Description"
              placeholder="Enter category description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              onKeyDown={handleEnterKey}
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
            onPress={handleAdd}
            isLoading={loading}
            disabled={loading}
          >
            Add Category
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCategoryModal;