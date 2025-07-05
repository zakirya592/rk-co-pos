import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Textarea,
} from "@nextui-org/react";
import { FaPlus } from "react-icons/fa";

const PaymentModal = ({
  isOpen,
  onClose,
  total,
  paymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  totalPaid,
  completeSale,
  saleData,
  updateSaleData,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="2xl"
    backdrop="opaque"
    isDismissable={false}
    hideCloseButton={false}
  >
    <ModalContent>
      <ModalHeader>Payment Details</ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <div className="text-lg font-bold">
              Total Amount: Rs. {total.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Payment Methods</h4>
              <Button
                size="sm"
                onPress={addPaymentMethod}
                startContent={<FaPlus />}
              >
                Add Payment
              </Button>
            </div>

            {paymentMethods.map((payment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex gap-2">
                  <Select
                    placeholder="Payment Method"
                    value={payment.method}
                    onChange={(e) =>
                      updatePaymentMethod(index, "method", e.target.value)
                    }
                    className="flex-1"
                  >
                    <SelectItem key="cash" value="cash">
                      Cash
                    </SelectItem>
                    <SelectItem key="card" value="card">
                      Card
                    </SelectItem>
                    <SelectItem key="bank" value="bank">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem key="easypaisa" value="easypaisa">
                      EasyPaisa
                    </SelectItem>
                    <SelectItem key="jazzcash" value="jazzcash">
                      JazzCash
                    </SelectItem>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e) =>
                      updatePaymentMethod(index, "amount", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <div className="space-y-4">
              <Textarea
                label="Description"
                labelPlacement="outside"
                placeholder="Add description..."
                value={saleData.description}
                onChange={(e) =>
                  updateSaleData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-2 rounded">
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-bold">
                  Rs. {totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span
                  className={`font-bold ${
                    total - totalPaid > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Rs. {(total - totalPaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button
          color="success"
          onPress={completeSale}
          isDisabled={totalPaid < total}
        >
          Complete Sale
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default PaymentModal;