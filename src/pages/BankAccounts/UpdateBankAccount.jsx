import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Select, SelectItem, Card, CardBody, Divider } from '@nextui-org/react';
import { FaArrowLeft, FaSave, FaUniversity } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const accountTypes = [
    { label: 'Current Account', value: 'current' },
    { label: 'Savings Account', value: 'savings' },
    { label: 'Business Account', value: 'business' },
    { label: 'Salary Account', value: 'salary' },
];

const UpdateBankAccount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [formData, setFormData] = useState({
        accountName: "",
        accountNumber: "",
        bankName: "",
        branchName: "",
        branchCode: "",
        accountType: "",
        currency: "PKR",
        openingBalance: "",
        swiftCode: "",
        iban: "",
        contactPerson: "",
        contactNumber: "",
        isActive: true,
    });

    useEffect(() => {
        const fetchBankAccount = async () => {
            try {
                const response = await userRequest.get(`/bank-accounts/${id}`);
                const account = response.data?.data?.bankAccount || response.data;

                if (account) {
                    setFormData({
                        accountName: account.accountName || "",
                        accountNumber: account.accountNumber || "",
                        bankName: account.bankName || "",
                        branchName: account.branchName || "",
                        branchCode: account.branchCode || "",
                        accountType: account.accountType || "",
                        currency: account.currency || "PKR",
                        openingBalance: account.openingBalance?.toString() || "0",
                        swiftCode: account.swiftCode || "",
                        iban: account.iban || "",
                        contactPerson: account.contactPerson || "",
                        contactNumber: account.contactNumber || "",
                        isActive: account.isActive !== undefined ? account.isActive : true,
                    });
                }
            } catch (error) {
                console.error("Error fetching bank account:", error);
                toast.error("Failed to load bank account details");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchBankAccount();
        } else {
            setIsLoading(false);
        }
    }, [id]);
    // Fetch currencies on component mount
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await userRequest.get("/currencies");
                setCurrencies(response.data.data || []);

                // Set default currency to PKR if available
                const pkrCurrency = response.data.data?.find((c) => c.code === "PKR");
                if (pkrCurrency) {
                    setFormData((prev) => ({
                        ...prev,
                        currency: pkrCurrency._id,
                    }));
                } else if (response.data.data?.[0]?._id) {
                    // Fallback to first currency if PKR not found
                    setFormData((prev) => ({
                        ...prev,
                        currency: response.data.data[0]._id,
                    }));
                }
            } catch (error) {
                console.error("Error fetching currencies:", error);
                toast.error("Failed to load currencies");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                openingBalance: parseFloat(formData.openingBalance) || 0,
            };

            await userRequest.put(`/bank-accounts/${id}`, payload);
            toast.success("Bank account updated successfully");
            navigate("/bank-accounts");
        } catch (error) {
            console.error("Error updating bank account:", error);
            toast.error(
                error.response?.data?.message || "Failed to update bank account"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex items-center mb-6">
                <Button
                    isIconOnly
                    variant="light"
                    className="mr-2"
                    onPress={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </Button>
                <div className="flex items-center">
                    <FaUniversity className="text-2xl mr-2 text-primary" />
                    <h1 className="text-2xl font-bold">Update Bank Account</h1>
                </div>
            </div>

            <Card className="">
                <CardBody className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Input
                                isRequired
                                label="Account Name"
                                labelPlacement="outside"
                                name="accountName"
                                value={formData.accountName}
                                onChange={handleChange}
                                placeholder="e.g., Business Operations Account"
                            />

                            <Input
                                isRequired
                                label="Account Number"
                                name="accountNumber"
                                labelPlacement="outside"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                placeholder="e.g., 1234567890"
                            />

                            <Input
                                isRequired
                                label="Bank Name"
                                labelPlacement="outside"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                placeholder="e.g., ABC Bank"
                            />

                            <Input
                                label="Branch Name"
                                name="branchName"
                                labelPlacement="outside"
                                value={formData.branchName}
                                onChange={handleChange}
                                placeholder="e.g., Main Branch"
                            />

                            <Input
                                label="Branch Code"
                                labelPlacement="outside"
                                name="branchCode"
                                value={formData.branchCode}
                                onChange={handleChange}
                                placeholder="e.g., ABC-001"
                            />

                            <Select
                                isRequired
                                label="Account Type"
                                labelPlacement="outside"
                                name="accountType"
                                selectedKeys={
                                    formData.accountType ? [formData.accountType] : []
                                }
                                onChange={(e) =>
                                    setFormData({ ...formData, accountType: e.target.value })
                                }
                                placeholder="Select account type"
                            >
                                {accountTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            {/* <Input
                label="Currency"
                name="currency"
                labelPlacement="outside"
                value={formData.currency}
                onChange={handleChange}
                placeholder="e.g., PKR"
              /> */}
                            <Select
                                label="Currency"
                                name="currency"
                                labelPlacement="outside"
                                selectedKeys={formData.currency ? [formData.currency] : []}
                                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                placeholder="Select currency"
                                isLoading={isLoading}
                            >
                                {currencies.map((currency) => (
                                    <SelectItem
                                        key={currency._id}
                                        value={currency._id}
                                        textValue={`${currency.name} ${currency.symbol}`}
                                    >
                                        {currency.code} - {currency.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input
                                label="Opening Balance"
                                name="openingBalance"
                                labelPlacement="outside"
                                type="number"
                                value={formData.openingBalance}
                                onChange={handleChange}
                                placeholder="0.00"
                                startContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-400 text-small">$</span>
                                    </div>
                                }
                            />

                            <Input
                                label="SWIFT/BIC Code"
                                name="swiftCode"
                                labelPlacement="outside"
                                value={formData.swiftCode}
                                onChange={handleChange}
                                placeholder="e.g., ABCCPKKA"
                            />

                            <Input
                                label="IBAN"
                                name="iban"
                                labelPlacement="outside"
                                value={formData.iban}
                                onChange={handleChange}
                                placeholder="e.g., PK36ABCD1234567890123456"
                            />

                            <Input
                                label="Contact Person"
                                name="contactPerson"
                                labelPlacement="outside"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                placeholder="e.g., John Doe"
                            />

                            <Input
                                label="Contact Number"
                                name="contactNumber"
                                labelPlacement="outside"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="e.g., +923001234567"
                            />

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    labelPlacement="outside"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="isActive"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    Active Account
                                </label>
                            </div>
                        </div>

                        <Divider className="my-6" />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="flat"
                                onPress={() => navigate("/bank-accounts")}
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                startContent={<FaSave />}
                                isLoading={isSubmitting}
                            >
                                Update Bank Account
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default UpdateBankAccount;
