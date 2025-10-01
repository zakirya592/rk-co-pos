import React, { useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const AddSalesDistributionExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    salesPeriod: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    salesperson: '', // salesperson id
    salesTeam: '',
    commissionAmount: 0,
    commissionRate: 0,
    customerDiscounts: 0,
    creditLoss: 0,
    badDebts: 0,
    promotionalCost: 0,
    marketingCost: 0,

    currency: '',
    exchangeRate: 1,

    customer: '', // customer id
    salesAmount: 0,
    paymentMethod: 'cash',
    expenseType: 'marketing',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [currencyRes] = await Promise.all([
          userRequest.get('/currencies'),
        ]);
        setCurrencies(currencyRes.data.data || []);
        const pkr = (currencyRes.data.data || []).find((c) => c.code === 'PKR');
        setFormData((prev) => ({ ...prev, currency: pkr?._id || (currencyRes.data.data?.[0]?._id || '') }));

        // Try to load customers and users if available (optional)
        try {
          const cRes = await userRequest.get('/customers');
          setCustomers(cRes.data.data || []);
        } catch (e) {
          // optional
        }
        try {
          const uRes = await userRequest.get('/users');
          setUsers(uRes.data.data || []);
        } catch (e) {
          // optional
        }
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
    const numericFields = [
      'commissionAmount',
      'commissionRate',
      'customerDiscounts',
      'creditLoss',
      'badDebts',
      'promotionalCost',
      'marketingCost',
      'exchangeRate',
      'salesAmount',
    ];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) || 0 : value,
    }));
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      salesPeriod: { ...prev.salesPeriod, [name]: value },
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        salesPeriod: {
          startDate: formData.salesPeriod.startDate ? new Date(formData.salesPeriod.startDate).toISOString() : null,
          endDate: formData.salesPeriod.endDate ? new Date(formData.salesPeriod.endDate).toISOString() : null,
        },
      };
      await userRequest.post('/expenses/sales-distribution', payload);
      toast.success('Sales distribution expense added successfully');
      navigate('/expenses/sales-distribution');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add sales distribution expense');
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
        <h1 className="text-2xl font-bold">Add Sales Distribution Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  name="startDate"
                  label="Start Date"
                  labelPlacement="outside"
                  value={formData.salesPeriod.startDate}
                  onChange={handlePeriodChange}
                />
                <Input
                  type="date"
                  name="endDate"
                  label="End Date"
                  labelPlacement="outside"
                  value={formData.salesPeriod.endDate}
                  onChange={handlePeriodChange}
                />
              </div>

              <Input
                name="salesTeam"
                label="Sales Team"
                placeholder="e.g., North Region"
                labelPlacement="outside"
                value={formData.salesTeam}
                onChange={handleChange}
              />

              {users.length > 0 ? (
                <Select
                  label="Salesperson"
                  placeholder="Select salesperson"
                  labelPlacement="outside"
                  selectedKeys={
                    formData.salesperson ? [formData.salesperson] : []
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salesperson: e.target.value,
                    }))
                  }
                >
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name || u.email || u._id}
                    </SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  name="salesperson"
                  label="Salesperson ID"
                  placeholder="Salesperson ID"
                  labelPlacement="outside"
                  value={formData.salesperson}
                  onChange={handleChange}
                />
              )}

              {customers.length > 0 ? (
                <Select
                  label="Customer"
                  placeholder="Select customer"
                  labelPlacement="outside"
                  selectedKeys={formData.customer ? [formData.customer] : []}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer: e.target.value,
                    }))
                  }
                >
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name || c.email || c._id}
                    </SelectItem>
                  ))}
                </Select>
              ) : (
                <Input
                  name="customer"
                  label="Customer ID"
                  placeholder="Customer ID"
                  labelPlacement="outside"
                  value={formData.customer}
                  onChange={handleChange}
                />
              )}

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
                  name="salesAmount"
                  label="Sales Amount"
                  labelPlacement="outside"
                  value={formData.salesAmount}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="commissionRate"
                  label="Commission Rate (%)"
                  labelPlacement="outside"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                />
                <Input
                  type="number"
                  name="commissionAmount"
                  label="Commission Amount"
                  labelPlacement="outside"
                  value={formData.commissionAmount}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="customerDiscounts"
                  label="Customer Discounts"
                  labelPlacement="outside"
                  value={formData.customerDiscounts}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="creditLoss"
                  label="Credit Loss"
                  labelPlacement="outside"
                  value={formData.creditLoss}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="badDebts"
                  label="Bad Debts"
                  labelPlacement="outside"
                  value={formData.badDebts}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="promotionalCost"
                  label="Promotional Cost"
                  labelPlacement="outside"
                  value={formData.promotionalCost}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="marketingCost"
                  label="Marketing Cost"
                  labelPlacement="outside"
                  value={formData.marketingCost}
                  onChange={handleChange}
                  min={0}
                />
              </div>

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
                <SelectItem key="cash" value="cash">
                  Cash
                </SelectItem>
                <SelectItem key="bank" value="bank">
                  Bank Transfer
                </SelectItem>
                <SelectItem key="credit" value="credit">
                  Credit
                </SelectItem>
                <SelectItem key="mixed" value="mixed">
                  Mixed
                </SelectItem>
              </Select>

              <Select
                label="Expense Type"
                placeholder="Select expense type"
                labelPlacement="outside"
                selectedKeys={[formData.expenseType]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expenseType: e.target.value,
                  }))
                }
              >
                <SelectItem key="marketing" value="marketing">
                  Marketing
                </SelectItem>
                <SelectItem key="promotion" value="promotion">
                  Promotion
                </SelectItem>
                <SelectItem key="commission" value="commission">
                  Commission
                </SelectItem>
                <SelectItem key="other" value="other">
                  Other
                </SelectItem>
              </Select>
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
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSalesDistributionExpense;
