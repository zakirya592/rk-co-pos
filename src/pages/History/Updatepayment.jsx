import React, { useState } from "react";
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
import toast from "react-hot-toast";

const Updatepayment = ({ isOpen, onClose, refetch, selectedPayment }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [saleDataadd, setSaleDataadd] = useState({
        note: "",
        description: "",
        currency: "",
    });
    const addPaymentMethod = () => {
        setPaymentMethods([...paymentMethods, { method: "cash", amount: 0 }]);
    };

    const updatePaymentMethod = (index, field, value) => {
        const updated = paymentMethods.map((payment, i) =>
            i === index ? { ...payment, [field]: value } : payment
        );
        setPaymentMethods(updated);
    };

    const fetchCurrencies = async () => {
        const res = await userRequest.get("/currencies");
        return res.data.data || [];
    };

    const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
        ["currencies"],
        fetchCurrencies
    );

    const handleSalepaymets = async () => {
        setIsLoading(true);

        const newAmount = Number(paymentMethods[0]?.amount || 0);
        const totalPaid = Number(selectedPayment?.summary?.totalPaid || 0);
        const totalInvoiced = Number(selectedPayment?.summary?.totalInvoiced || 0);
        let status = "pending";

        const totalAfterThisPayment = totalPaid + newAmount;

        if (totalAfterThisPayment === totalInvoiced) {
            status = "completed";
        } else if (totalAfterThisPayment < totalInvoiced && newAmount > 0) {
            status = "partial";
        }
        try {
            await userRequest.post("/payments/customer", {
                customerId: selectedPayment?.customer?._id,
                amount: paymentMethods[0]?.amount,
                paymentMethod: paymentMethods[0]?.method || "cash",
                status: status,
                currency: saleDataadd.currency,
                notes: saleDataadd.description,
                distributionStrategy: "oldest-first",
            });
            refetch();
            onClose();
            setPaymentMethods([]);
            setSaleDataadd({
                note: "",
                description: "",
                currency: "",
            });
            toast.success("Payment completed successfully!");
            setIsLoading(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to add Payment.");
            setIsLoading(false);
        }
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
                    <ModalHeader>Payment Details</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
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
                                        value={saleDataadd.currency}
                                        onChange={(e) =>
                                            setSaleDataadd({
                                                ...saleDataadd,
                                                currency: e.target.value,
                                            })
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
                                        value={saleDataadd.description}
                                        onChange={(e) =>
                                            setSaleDataadd((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                        className="w-full"
                                        rows={3}
                                    />
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
                            onPress={handleSalepaymets}
                            isLoading={isLoading}
                        // isDisabled={totalPaid < total}
                        >
                            {isLoading ? "Processing..." : "Save"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Updatepayment;
