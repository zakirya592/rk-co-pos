import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditWarehouseExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    warehouse: '',
    expenseSubType: 'rent',
    expensePeriod: { startDate: '', endDate: '' },
    storageDuration: 'monthly',

    rentAmount: 0,
    utilities: { electricity: 0, water: 0, gas: 0, internet: 0 },
    staffSalaries: 0,
    securityCost: 0,
    repairsCost: 0,
    maintenanceCost: 0,

    currency: '',
    exchangeRate: 1,

    linkedStock: '',
    linkedBatch: '',

    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [expenseRes, whRes, currencyRes, productsRes] = await Promise.all([
          userRequest.get(`/expenses/warehouse/${id}`),
          userRequest.get('/warehouses'),
          userRequest.get('/currencies'),
          userRequest.get('/products'),
        ]);
        setWarehouses(whRes.data.data || []);
        setCurrencies(currencyRes.data.data || []);
        setProducts(productsRes.data.data || []);

        const e = expenseRes.data.data;
        setFormData({
          warehouse: e.warehouse?._id || '',
          expenseSubType: e.expenseSubType || 'rent',
          expensePeriod: {
            startDate: formatDateForInput(e.expensePeriod?.startDate),
            endDate: formatDateForInput(e.expensePeriod?.endDate),
          },
          storageDuration: e.storageDuration || 'monthly',
          rentAmount: e.rentAmount || 0,
          utilities: {
            electricity: e.utilities?.electricity || 0,
            water: e.utilities?.water || 0,
            gas: e.utilities?.gas || 0,
            internet: e.utilities?.internet || 0,
          },
          staffSalaries: e.staffSalaries || 0,
          securityCost: e.securityCost || 0,
          repairsCost: e.repairsCost || 0,
          maintenanceCost: e.maintenanceCost || 0,
          currency: e.currency?._id || '',
          exchangeRate: e.exchangeRate || 1,
          linkedStock: e.linkedStock?._id || '',
          linkedBatch: e.linkedBatch || '',
          paymentMethod: e.paymentMethod || 'cash',
          notes: e.notes || '',
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to load expense');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['rentAmount','staffSalaries','securityCost','repairsCost','maintenanceCost','exchangeRate'].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const handlePeriodChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      expensePeriod: { ...prev.expensePeriod, [name]: value },
    }));
  };

  const handleUtilityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      utilities: { ...prev.utilities, [name]: Number(value) || 0 },
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        expensePeriod: {
          startDate: formData.expensePeriod.startDate ? new Date(formData.expensePeriod.startDate).toISOString() : null,
          endDate: formData.expensePeriod.endDate ? new Date(formData.expensePeriod.endDate).toISOString() : null,
        },
      };
      await userRequest.put(`/expenses/warehouse/${id}`, payload);
      toast.success('Warehouse expense updated successfully');
      navigate('/expenses/warehouse');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update warehouse expense');
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
        <h1 className="text-2xl font-bold">Edit Warehouse Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                label="Warehouse"
                placeholder="Select warehouse"
                labelPlacement="outside"
                selectedKeys={formData.warehouse ? [formData.warehouse] : []}
                onChange={(e) => setFormData(prev => ({ ...prev, warehouse: e.target.value }))}
              >
                {warehouses.map(w => (
                  <SelectItem key={w._id} value={w._id}>{w.name}</SelectItem>
                ))}
              </Select>

              <Select
                label="Expense Type"
                placeholder="Select expense type"
                labelPlacement="outside"
                selectedKeys={[formData.expenseSubType]}
                onChange={(e) => setFormData(prev => ({ ...prev, expenseSubType: e.target.value }))}
              >
                <SelectItem key="rent" value="rent">Rent</SelectItem>
                <SelectItem key="utilities" value="utilities">Utilities</SelectItem>
                <SelectItem key="staff" value="staff">Staff Salaries</SelectItem>
                <SelectItem key="security" value="security">Security</SelectItem>
                <SelectItem key="repairs" value="repairs">Repairs</SelectItem>
                <SelectItem key="maintenance" value="maintenance">Maintenance</SelectItem>
                <SelectItem key="other" value="other">Other</SelectItem>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" name="startDate" label="Start Date" labelPlacement="outside" value={formData.expensePeriod.startDate} onChange={handlePeriodChange} />
                <Input type="date" name="endDate" label="End Date" labelPlacement="outside" value={formData.expensePeriod.endDate} onChange={handlePeriodChange} />
              </div>

              <Select
                label="Storage Duration"
                placeholder="Select duration"
                labelPlacement="outside"
                selectedKeys={[formData.storageDuration]}
                onChange={(e) => setFormData(prev => ({ ...prev, storageDuration: e.target.value }))}
              >
                <SelectItem key="daily" value="daily">Daily</SelectItem>
                <SelectItem key="weekly" value="weekly">Weekly</SelectItem>
                <SelectItem key="monthly" value="monthly">Monthly</SelectItem>
              </Select>

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
                  {currencies.map(c => (
                    <SelectItem key={c._id} value={c._id}>{`${c.code} - ${c.name}`}</SelectItem>
                  ))}
                </Select>

                <Input type="number" name="exchangeRate" label="Exchange Rate" placeholder="1.00" labelPlacement="outside" value={formData.exchangeRate} onChange={handleChange} min={0} step={0.01} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="number" name="rentAmount" label="Rent Amount" labelPlacement="outside" value={formData.rentAmount} onChange={handleChange} min={0} />
                <Input type="number" name="staffSalaries" label="Staff Salaries" labelPlacement="outside" value={formData.staffSalaries} onChange={handleChange} min={0} />
                <Input type="number" name="securityCost" label="Security Cost" labelPlacement="outside" value={formData.securityCost} onChange={handleChange} min={0} />
                <Input type="number" name="repairsCost" label="Repairs Cost" labelPlacement="outside" value={formData.repairsCost} onChange={handleChange} min={0} />
                <Input type="number" name="maintenanceCost" label="Maintenance Cost" labelPlacement="outside" value={formData.maintenanceCost} onChange={handleChange} min={0} />
              </div>

              <div>
                <h3 className="font-medium">Utilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <Input type="number" name="electricity" label="Electricity" labelPlacement="outside" value={formData.utilities.electricity} onChange={handleUtilityChange} min={0} />
                  <Input type="number" name="water" label="Water" labelPlacement="outside" value={formData.utilities.water} onChange={handleUtilityChange} min={0} />
                  <Input type="number" name="gas" label="Gas" labelPlacement="outside" value={formData.utilities.gas} onChange={handleUtilityChange} min={0} />
                  <Input type="number" name="internet" label="Internet" labelPlacement="outside" value={formData.utilities.internet} onChange={handleUtilityChange} min={0} />
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Linked Stock"
                  placeholder="Select product (optional)"
                  labelPlacement="outside"
                  selectedKeys={formData.linkedStock ? [formData.linkedStock] : []}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedStock: e.target.value }))}
                >
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                  ))}
                </Select>
                <Input name="linkedBatch" label="Linked Batch" placeholder="BATCH-001" labelPlacement="outside" value={formData.linkedBatch} onChange={handleChange} />
              </div>

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                labelPlacement="outside"
                selectedKeys={[formData.paymentMethod]}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <SelectItem key="cash" value="cash">Cash</SelectItem>
                <SelectItem key="bank" value="bank">Bank Transfer</SelectItem>
                <SelectItem key="credit" value="credit">Credit</SelectItem>
                <SelectItem key="mixed" value="mixed">Mixed</SelectItem>
              </Select>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="flat" onPress={() => navigate(-1)} isDisabled={isSubmitting}>Cancel</Button>
          <Button color="primary" type="submit" isLoading={isSubmitting} startContent={!isSubmitting && <FaSave />}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
};

export default EditWarehouseExpense;
