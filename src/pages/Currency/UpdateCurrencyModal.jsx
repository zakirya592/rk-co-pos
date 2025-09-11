import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Spinner } from '@nextui-org/react';

const UpdateCurrencyModal = ({
  isOpen,
  onClose,
  editCurrency,
  setEditCurrency,
  onEditCurrency
}) => {
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    await onEditCurrency();
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
        <ModalHeader>Update Currency</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Currency Name"
              placeholder="Enter currency name"
              value={editCurrency.name}
              onChange={(e) =>
                setEditCurrency({ ...editCurrency, name: e.target.value })
              }
              variant="bordered"
              required
            />
            <Input
              label="Currency Code"
              placeholder="Enter currency code (e.g. USD)"
              value={editCurrency.code || ""}
              onChange={(e) =>
                setEditCurrency({ ...editCurrency, code: e.target.value })
              }
              variant="bordered"
              required
            />
            <Input
              label="Currency Symbol"
              placeholder="Enter currency symbol"
              value={editCurrency.symbol}
              onChange={(e) =>
                setEditCurrency({ ...editCurrency, symbol: e.target.value })
              }
              variant="bordered"
              required
            />
            <Input
              label="Exchange Rate"
              placeholder="Enter exchange rate"
              type="number"
              value={editCurrency.exchangeRate || ""}
              onChange={(e) =>
                setEditCurrency({
                  ...editCurrency,
                  exchangeRate: e.target.value,
                })
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
            onPress={handleEdit}
            isLoading={loading}
            disabled={loading}
          >
            Update Currency
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCurrencyModal;
