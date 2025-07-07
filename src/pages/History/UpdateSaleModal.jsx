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
    Button,
    Chip,
} from '@nextui-org/react';
import { FaMoneyBill, FaCalendarCheck, FaNotesMedical } from 'react-icons/fa';
import toast from 'react-hot-toast';
import userRequest from '../../utils/userRequest';

const UpdateSaleModal = ({
  isOpen,
  onClose,
  saleId,
  saleData,
  setSaleData,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);

  const [saleDataadd, setSaleDataadd] = useState({
    notes: saleData?.notes || "",
    newPaidAmount: "",
  });

  const handleUpdateSale = async () => {
    setLoading(true);
    const totalPaid =
      Number(saleData.paidAmount) + Number(saleDataadd.newPaidAmount);
    const grandTotal = Number(saleData.grandTotal);

    // Determine payment status
    let paymentStatus;
    if (totalPaid >= grandTotal) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "unpaid";
    }

    try {
      await userRequest.put(`/sales/${saleId}`, {
        paymentStatus: paymentStatus,
        paidAmount: totalPaid,
        notes: saleDataadd.notes,
      });

      toast.success("Sale updated successfully!");
      refetch();
      onClose();
      setSaleDataadd({
        notes: "",
        newPaidAmount: "",
      });
      setLoading(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update sale."
      );
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>Update Sale Payment</ModalHeader>
        <ModalBody>
          <div className="space-y-4 ">
            {/* Amounts Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold ml-2">
                      {saleData?.grandTotal || 0}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-full">
                    <FaMoneyBill className="text-blue-500" />
                  </div>
                </div>
                <span className="text-sm text-gray-500 mt-1">Total Amount</span>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold ml-2">
                      {saleData?.dueAmount || 0}
                    </span>
                  </div>
                  <div className="bg-red-50 p-2 rounded-full">
                    <FaCalendarCheck className="text-red-500" />
                  </div>
                </div>
                <span className="text-sm text-gray-500 mt-1">Due Amount</span>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold ml-2">
                      {saleData?.paidAmount || 0}
                    </span>
                  </div>
                  <div className="bg-green-50 p-2 rounded-full">
                    <FaMoneyBill className="text-green-500" />
                  </div>
                </div>
                <span className="text-sm text-gray-500 mt-1">Paid Amount</span>
              </div>
            </div>
            {/* Input Fields */}
            <div className="gap-7">
              <Input
                label="New Paid Amount"
                labelPlacement="outside"
                placeholder="Enter new paid amount"
                value={saleDataadd.newPaidAmount}
                onChange={(e) =>
                  setSaleDataadd((prev) => ({
                    ...prev,
                    newPaidAmount: e.target.value,
                  }))
                }
                name="paidAmount"
                type="number"
                min="0"
                startContent={<FaCalendarCheck />}
                variant="bordered"
                disabled={saleData?.dueAmount === 0}
              />

              <Input
                label="Notes"
                labelPlacement="outside"
                placeholder="Add any notes"
                value={saleDataadd.notes}
                onChange={(e) =>
                  setSaleDataadd((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                name="notes"
                type="text"
                startContent={<FaNotesMedical />}
                variant="bordered"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleUpdateSale}
            isLoading={loading}
          >
            Update Sale
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateSaleModal;
