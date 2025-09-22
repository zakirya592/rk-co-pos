import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const AddFinancialExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    expenseSubType: 'bank_charges',
    bankCharges: 0,
    transactionFees: 0,
    exchangeGainLoss: 0,
    loanInterest: 0,
    financeCharges: 0,

    currency: '',
    exchangeRate: 1,

    linkedBankAccount: '',
    paymentMethod: 'bank',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const totalCost = useMemo(() => {
    return (
      Number(formData.bankCharges || 0) +
      Number(formData.transactionFees || 0) +
      Number(formData.exchangeGainLoss || 0) +
      Number(formData.loanInterest || 0) +
      Number(formData.financeCharges || 0)
    );
  }, [formData]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [currencyRes] = await Promise.all([
          userRequest.get('/currencies'),
        ]);
        setCurrencies(currencyRes.data.data || []);
        // default currency try PKR
        const pkr = (currencyRes.data.data || []).find((c) => c.code === 'PKR');
        setFormData((prev) => ({ ...prev, currency: pkr?._id || (currencyRes.data.data?.[0]?._id || '') }));
      } catch (e) {
        console.error(e);
        toast.error('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numeric = ['bankCharges', 'transactionFees', 'exchangeGainLoss', 'loanInterest', 'financeCharges', 'exchangeRate'];
    setFormData((prev) => ({
      ...prev,
      [name]: numeric.includes(name) ? (Number(value) || 0) : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        linkedBankAccount: formData.linkedBankAccount || undefined,
        transactionDate: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : undefined,
      };
      await userRequest.post('/expenses/financial', payload);
      toast.success('Financial expense added successfully');
      navigate('/expenses/financial');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add financial expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button isIconOnly variant="light" className="mr-2" onPress={() => navigate(-1)}>
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Add Financial Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                label="Expense Type"
                placeholder="Select expense type"
                labelPlacement="outside"
                selectedKeys={[formData.expenseSubType]}
                onChange={(e) => setFormData((prev) => ({ ...prev, expenseSubType: e.target.value }))}
              >
                <SelectItem key="bank_charges" value="bank_charges">Bank Charges</SelectItem>
                <SelectItem key="interest" value="interest">Interest</SelectItem>
                <SelectItem key="fees" value="fees">Fees</SelectItem>
                <SelectItem key="exchange" value="exchange">Exchange Gain/Loss</SelectItem>
                <SelectItem key="other" value="other">Other</SelectItem>
              </Select>

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                labelPlacement="outside"
                selectedKeys={[formData.paymentMethod]}
                onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <SelectItem key="bank" value="bank">Bank</SelectItem>
                <SelectItem key="cash" value="cash">Cash</SelectItem>
                <SelectItem key="credit" value="credit">Credit</SelectItem>
                <SelectItem key="mixed" value="mixed">Mixed</SelectItem>
              </Select>

              <Input
                type="date"
                name="transactionDate"
                label="Transaction Date"
                labelPlacement="outside"
                value={formData.transactionDate}
                onChange={handleChange}
              />

              <Textarea
                name="notes"
                label="Notes"
                placeholder="Additional notes..."
                labelPlacement="outside"
                value={formData.notes}
                onChange={handleChange}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Financial Details</h2>
              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  labelPlacement="outside"
                  selectedKeys={formData.currency ? [formData.currency] : []}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  {currencies.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{`${c.code} - ${c.name}`}</SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  name="exchangeRate"
                  label="Exchange Rate"
                  placeholder="1.00"
                  labelPlacement="outside"
                  value={formData.exchangeRate}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="number" name="bankCharges" label="Bank Charges" labelPlacement="outside" value={formData.bankCharges} onChange={handleChange} min={0} />
                <Input type="number" name="transactionFees" label="Transaction Fees" labelPlacement="outside" value={formData.transactionFees} onChange={handleChange} min={0} />
                <Input type="number" name="exchangeGainLoss" label="Exchange Gain/Loss" labelPlacement="outside" value={formData.exchangeGainLoss} onChange={handleChange} min={0} />
                <Input type="number" name="loanInterest" label="Loan Interest" labelPlacement="outside" value={formData.loanInterest} onChange={handleChange} min={0} />
                <Input type="number" name="financeCharges" label="Finance Charges" labelPlacement="outside" value={formData.financeCharges} onChange={handleChange} min={0} />
              </div>

              <Divider />

              <div className="text-right text-sm text-gray-600">
                Estimated total: <span className="font-semibold">{totalCost.toLocaleString()}</span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="flat" onPress={() => navigate(-1)} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" isLoading={isSubmitting} startContent={!isSubmitting && <FaSave />}> 
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddFinancialExpense;
