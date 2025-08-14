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
import userRequest from "../../utils/userRequest";
import { useQuery } from "react-query";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const SuppliersPaymentmodel = ({
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
  selectedCustomer,
  isLoading,
}) => {

  const fetchCurrencies = async () => {
    const res = await userRequest.get("/currencies");
    return res.data.data || [];
  };
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
    ["currencies"],
    fetchCurrencies
  );

  const handleAdvancePayment = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will apply advance payment for this ${
        selectedCustomer?.name || ""
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, apply it!",
      cancelButtonText: "No, cancel!",
      customClass: {
        container: "z-1000",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.post(`/payments/apply-customer-advance`, {
            customerId: selectedCustomer?._id,
          });
          onClose();
          toast.success("Advance payment applied successfully!");
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to apply advance payment."
          );
        }
      }
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        backdrop="opaque"
        isDismissable={false}
        hideCloseButton={false}
        scrollBehavior="inside"
        className="max-h-[calc(100vh-1rem)]"
      >
        <ModalContent>
          <ModalHeader>
            <span className="flex items-center gap-2 me-4">
              Payment Details
            </span>
            {/* <Button
              color="primary"
              variant="flat"
              onPress={handleAdvancePayment}
            >
              Advance Payment
            </Button> */}
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <div className="text-lg font-bold">
                  Total Amount: Rs. {total.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ">
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
                        <SelectItem key="credit_card" value="credit_card">
                          Credit
                        </SelectItem>
                        <SelectItem key="debit_card" value="debit_card">
                          Debit Card
                        </SelectItem>
                        <SelectItem key="'bank_transfer" value="'bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem key="online_payment" value="online_payment">
                          Online
                        </SelectItem>
                        <SelectItem key="mobile_payment" value="mobile_payment">
                          Mobile Payment
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
                  <Select
                    label="Currency"
                    labelPlacement="outside"
                    placeholder="Select currency"
                    value={saleData.currency}
                    onChange={(e) =>
                      updateSaleData({ ...saleData, currency: e.target.value })
                    }
                    variant="bordered"
                    className="font-semibold "
                    showSearch
                  >
                    {currencies.map((currency) => (
                      <SelectItem
                        key={currency._id}
                        value={currency._id}
                        textValue={`${currency.name} ${currency.symbol}`}
                      >
                        {currency.name} {currency.symbol}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
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
                        total - totalPaid > 0
                          ? "text-red-600"
                          : "text-green-600"
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
              isLoading={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
              // isDisabled={totalPaid < total}
            >
              Complete Sale
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SuppliersPaymentmodel;