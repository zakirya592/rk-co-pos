import React, { useEffect, useState } from "react";
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
  selectedCustomer,
}) => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchBankAccounts = async () => {
    const res = await userRequest.get("/bank-accounts");
    return res?.data?.data?.bankAccounts || res?.data?.data || [];
  };

  const fetchCurrencies = async () => {
    const res = await userRequest.get("/currencies");
    return res.data.data || [];
  };
  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
    ["currencies"],
    fetchCurrencies
  );
  const { data: bankAccounts = [] } = useQuery(
    ["bank-accounts"],
    fetchBankAccounts
  );

  useEffect(() => {
    if (!saleData?.currency && currencies.length) {
      updateSaleData((prev) => ({
        ...prev,
        currency: prev?.currency || currencies[0]?._id || "",
      }));
    }
  }, [currencies, saleData?.currency, updateSaleData]);

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
          onClose()
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
              Sale Payment
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
                        <SelectItem key="bank_transfer" value="bank_transfer">
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
                    {payment.method === "bank_transfer" && (
                      <div className="flex flex-col gap-2">
                        <Select
                          placeholder="Select Bank Account"
                          value={payment.bankAccount}
                          onChange={(e) =>
                            updatePaymentMethod(
                              index,
                              "bankAccount",
                              e.target.value
                            )
                          }
                          className="w-full"
                        >
                          {bankAccounts.map((account) => (
                            <SelectItem
                              key={account._id}
                              value={account._id}
                              textValue={`${account.bankName} - ${account.accountName}`}
                            >
                              {account.bankName} ({account.accountName})
                            </SelectItem>
                          ))}
                        </Select>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm text-gray-600">
                            Upload proof (image/pdf)
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) =>
                              updatePaymentMethod(
                                index,
                                "proofFile",
                                e.target.files?.[0] || null
                              )
                            }
                            className="block w-full text-sm text-gray-700"
                          />
                          {payment?.proofFile?.name && (
                            <span className="text-xs text-gray-500">
                              Selected: {payment.proofFile.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="datetime-local"
                    label="Payment Date & Time"
                    labelPlacement="outside"
                    value={saleData.paymentDate}
                    onChange={(e) =>
                      updateSaleData((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="text"
                    label="Transaction ID"
                    labelPlacement="outside"
                    placeholder="Enter transaction/reference ID"
                    value={saleData.transactionId}
                    onChange={(e) =>
                      updateSaleData((prev) => ({
                        ...prev,
                        transactionId: e.target.value,
                      }))
                    }
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
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              onPress={async () => {
                try {
                  setIsSubmitting(true);
                  await completeSale();
                } finally {
                  setIsSubmitting(false);
                }
              }}
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

export default PaymentModal;