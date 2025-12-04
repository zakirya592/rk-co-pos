import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
} from "@nextui-org/react";

const AddSubcategoryModal = ({
  isOpen,
  onClose,
  categories = [],
  newSubcategory,
  setNewSubcategory,
  onAddSubcategory,
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

  const handleAdd = async () => {
    setLoading(true);
    await onAddSubcategory();
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
        <ModalHeader>Create Subcategory</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Subcategory Name"
              placeholder="Premium Cigarettes"
              value={newSubcategory.name}
              onChange={(e) =>
                setNewSubcategory({ ...newSubcategory, name: e.target.value })
              }
              onKeyDown={handleEnterKey}
              variant="bordered"
              required
            />

            <Select
              label="Parent Category"
              placeholder="Select a category"
              value={newSubcategory.category}
              onChange={(e) =>
                setNewSubcategory({
                  ...newSubcategory,
                  category: e.target.value,
                })
              }
              onKeyDown={handleEnterKey}
              variant="bordered"
              required
              isDisabled={!categories.length}
            >
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>

            <Textarea
              label="Description"
              placeholder="High-end premium cigarette brands"
              value={newSubcategory.description}
              onChange={(e) =>
                setNewSubcategory({
                  ...newSubcategory,
                  description: e.target.value,
                })
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
            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
            onPress={handleAdd}
            isLoading={loading}
            disabled={loading}
          >
            Save Subcategory
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddSubcategoryModal;

