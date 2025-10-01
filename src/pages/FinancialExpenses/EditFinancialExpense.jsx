import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const EditFinancialExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);

  const [BankAccount, setBankAccount] = useState([]);

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
    transactionDate: '',
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
        const [expRes, currencyRes, BannuAccountRes] = await Promise.all([
          userRequest.get(`/expenses/financial/${id}`),
          userRequest.get("/currencies"),
          userRequest.get("/bank-accounts"),
        ]);

        setCurrencies(currencyRes.data.data || []);
        setBankAccount(BannuAccountRes.data.data.bankAccounts || []);

        const e = expRes.data.data.expense;
        console.log(e);
        
        setFormData({
          expenseSubType: e.expenseSubType || 'bank_charges',
          bankCharges: e.bankCharges || 0,
          transactionFees: e.transactionFees || 0,
          exchangeGainLoss: e.exchangeGainLoss || 0,
          loanInterest: e.loanInterest || 0,
          financeCharges: e.financeCharges || 0,
          currency: e.currency?._id || '',
          exchangeRate: e.exchangeRate || 1,
          linkedBankAccount: e.linkedBankAccount?._id || '',
          paymentMethod: e.paymentMethod || 'bank',
          transactionDate: formatDateForInput(e.transactionDate),
          notes: e.notes || '',
        });
      } catch (e) {
        console.error(e);
        toast.error('Failed to load financial expense');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

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
        // linkedBankAccount: formData.linkedBankAccount || undefined,
        transactionDate: formData.transactionDate ? new Date(formData.transactionDate).toISOString() : undefined,
      };
      await userRequest.put(`/expenses/financial/${id}`, payload);
      toast.success('Financial expense updated successfully');
      navigate('/expenses/financial');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update financial expense');
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
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => navigate(-1)}
        >
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Edit Financial Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-6">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                label="Expense Type"
                placeholder="Select expense type"
                labelPlacement="outside"
                selectedKeys={[formData.expenseSubType]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expenseSubType: e.target.value,
                  }))
                }
              >
                <SelectItem key="bank_charges" value="bank_charges">
                  Bank Charges
                </SelectItem>
                <SelectItem key="interest" value="interest">
                  Interest
                </SelectItem>
                <SelectItem key="fees" value="fees">
                  Fees
                </SelectItem>
                <SelectItem key="exchange" value="exchange">
                  Exchange Gain/Loss
                </SelectItem>
                <SelectItem key="other" value="other">
                  Other
                </SelectItem>
              </Select>

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                labelPlacement="outside"
                selectedKeys={[formData.paymentMethod]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
              >
                <SelectItem key="bank" value="bank">
                  Bank
                </SelectItem>
                <SelectItem key="cash" value="cash">
                  Cash
                </SelectItem>
                <SelectItem key="credit" value="credit">
                  Credit
                </SelectItem>
              </Select>
              <Select
                label="Bank Account"
                placeholder="Select bank account"
                labelPlacement="outside"
                selectedKeys={
                  formData.linkedBankAccount ? [formData.linkedBankAccount] : []
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    linkedBankAccount: e.target.value,
                  }))
                }
              >
                {BankAccount.map((c) => (
                  <SelectItem
                    key={c._id}
                    value={c._id}
                  >{`${c.bankName} - (${c.accountName})`}</SelectItem>
                ))}
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
            <CardBody className="space-y-6">
              <h2 className="text-lg font-semibold">Financial Details</h2>
              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Currency"
                  placeholder="Select currency"
                  labelPlacement="outside"
                  selectedKeys={formData.currency ? [formData.currency] : []}
                  onChange={(e) => {
                    const selectedCurrency = currencies.find(
                      (c) => c._id === e.target.value
                    );

                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                      exchangeRate: selectedCurrency
                        ? selectedCurrency.exchangeRate
                        : 1, // auto-fill exchangeRate
                    }));
                  }}
                >
                  {currencies.map((c) => (
                    <SelectItem
                      key={c._id}
                      value={c._id}
                    >{`${c.code} - ${c.name}`}</SelectItem>
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
                <Input
                  type="number"
                  name="bankCharges"
                  label="Bank Charges"
                  labelPlacement="outside"
                  value={formData.bankCharges}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="transactionFees"
                  label="Transaction Fees"
                  labelPlacement="outside"
                  value={formData.transactionFees}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="exchangeGainLoss"
                  label="Exchange Gain/Loss"
                  labelPlacement="outside"
                  value={formData.exchangeGainLoss}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="loanInterest"
                  label="Loan Interest"
                  labelPlacement="outside"
                  value={formData.loanInterest}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="financeCharges"
                  label="Finance Charges"
                  labelPlacement="outside"
                  value={formData.financeCharges}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              <Divider />

              <div className="text-right text-sm text-gray-600">
                Estimated total:{" "}
                <span className="font-semibold">
                  {totalCost.toLocaleString()}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            variant="flat"
            onPress={() => navigate(-1)}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={isSubmitting}
            startContent={!isSubmitting && <FaSave />}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditFinancialExpense;
