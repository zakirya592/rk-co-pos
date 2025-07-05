import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Spinner } from '@nextui-org/react';

const AddCurrencyModal = ({
  isOpen,
  onClose,
  newCurrency,
  setNewCurrency,
  onAddCurrency
}) => {
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await onAddCurrency();
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
        <ModalHeader>Add New Currency</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Currency Name"
              placeholder="Enter currency name"
              value={newCurrency.name}
              onChange={(e) =>
                setNewCurrency({ ...newCurrency, name: e.target.value })
              }
              variant="bordered"
              required
            />
            <Input
              label="Currency Symbol"
              placeholder="Enter currency symbol"
              value={newCurrency.symbol}
              onChange={(e) =>
                setNewCurrency({ ...newCurrency, symbol: e.target.value })
              }
              variant="bordered"
              required
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
            Add Currency
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCurrencyModal;
