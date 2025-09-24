import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, SelectItem, Card, CardBody, Divider, Spinner } from '@nextui-org/react';
import { FaArrowLeft, FaSave, FaUniversity } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const accountTypes = [
  { label: 'Current Account', value: 'current' },
  { label: 'Savings Account', value: 'savings' },
  { label: 'Business Account', value: 'business' },
  { label: 'Salary Account', value: 'salary' },
];

const AddBankAccount = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    branchCode: '',
    accountType: '',
    currency: '',
    openingBalance: '',
    swiftCode: '',
    iban: '',
    contactPerson: '',
    contactNumber: '',
    isActive: true,
  });

  // Fetch currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await userRequest.get('/currencies');
        setCurrencies(response.data.data || []);
        
        // Set default currency to PKR if available
        const pkrCurrency = response.data.data?.find(c => c.code === 'PKR');
        if (pkrCurrency) {
          setFormData(prev => ({
            ...prev,
            currency: pkrCurrency._id
          }));
        } else if (response.data.data?.[0]?._id) {
          // Fallback to first currency if PKR not found
          setFormData(prev => ({
            ...prev,
            currency: response.data.data[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert openingBalance to number
      const payload = {
        ...formData,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        balance: parseFloat(formData.openingBalance) || 0, // Set initial balance same as opening
      };
      
      await userRequest.post('/bank-accounts', payload);
      toast.success('Bank account added successfully');
      navigate('/bank-accounts');
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Add New Bank Account</h1>
        </div>
      </div>

      <Card className="">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                isRequired
                label="Account Name"
                name="accountName"
                labelPlacement="outside"
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
                name="bankName"
                labelPlacement="outside"
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
                name="branchCode"
                labelPlacement="outside"
                value={formData.branchCode}
                onChange={handleChange}
                placeholder="e.g., ABC-001"
              />

              <Select
                isRequired
                label="Account Type"
                name="accountType"
                labelPlacement="outside"
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
                // startContent={
                //   <div className="pointer-events-none flex items-center">
                //     <span className="text-default-400 text-small"></span>
                //   </div>
                // }
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
                labelPlacement="outside"
                name="contactPerson"
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
                Save Bank Account
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddBankAccount;
