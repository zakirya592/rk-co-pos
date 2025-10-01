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

const EditOperationalExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currencies, setCurrencies] = useState([]);

  const [formData, setFormData] = useState({
    expenseSubType: 'salaries',
    employeeSalaries: 0,
    officeRent: 0,
    officeSupplies: 0,
    stationery: 0,
    softwareExpenses: 0,
    equipmentCost: 0,
    insuranceCost: 0,
    utilities: { electricity: 0, internet: 0, phone: 0, water: 0 },
    currency: '',
    exchangeRate: 1,
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [expenseRes, currencyRes] = await Promise.all([
          userRequest.get(`/expenses/operational/${id}`),
          userRequest.get('/currencies'),
        ]);
        setCurrencies(currencyRes.data.data || []);
        const e = expenseRes.data.data;
        setFormData({
          expenseSubType: e.expenseSubType || 'salaries',
          employeeSalaries: e.employeeSalaries || 0,
          officeRent: e.officeRent || 0,
          officeSupplies: e.officeSupplies || 0,
          stationery: e.stationery || 0,
          softwareExpenses: e.softwareExpenses || 0,
          equipmentCost: e.equipmentCost || 0,
          insuranceCost: e.insuranceCost || 0,
          utilities: {
            electricity: e.utilities?.electricity || 0,
            internet: e.utilities?.internet || 0,
            phone: e.utilities?.phone || 0,
            water: e.utilities?.water || 0,
          },
          currency: e.currency?._id || '',
          exchangeRate: e.exchangeRate || 1,
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
    setFormData((prev) => ({
      ...prev,
      [name]: [
        'employeeSalaries',
        'officeRent',
        'officeSupplies',
        'stationery',
        'softwareExpenses',
        'equipmentCost',
        'insuranceCost',
        'exchangeRate',
      ].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleUtilityChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      utilities: { ...prev.utilities, [name]: Number(value) || 0 },
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      await userRequest.put(`/expenses/operational/${id}`, payload);
      toast.success('Operational expense updated successfully');
      navigate('/expenses/operational');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update operational expense');
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
        <h1 className="text-2xl font-bold">Edit Operational Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                label="Expense Type"
                placeholder="Select expense subtype"
                labelPlacement="outside"
                selectedKeys={[formData.expenseSubType]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expenseSubType: e.target.value,
                  }))
                }
              >
                <SelectItem key="salaries" value="salaries">
                  Salaries
                </SelectItem>
                <SelectItem key="rent" value="rent">
                  Office Rent
                </SelectItem>
                <SelectItem key="supplies" value="supplies">
                  Office Supplies
                </SelectItem>
                <SelectItem key="stationery" value="stationery">
                  Stationery
                </SelectItem>
                <SelectItem key="software" value="software">
                  Software Expenses
                </SelectItem>
                <SelectItem key="equipment" value="equipment">
                  Equipment
                </SelectItem>
                <SelectItem key="insurance" value="insurance">
                  Insurance
                </SelectItem>
                <SelectItem key="utilities" value="utilities">
                  Utilities
                </SelectItem>
                <SelectItem key="other" value="other">
                  Other
                </SelectItem>
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
                  name="employeeSalaries"
                  label="Employee Salaries"
                  labelPlacement="outside"
                  value={formData.employeeSalaries}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="officeRent"
                  label="Office Rent"
                  labelPlacement="outside"
                  value={formData.officeRent}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="officeSupplies"
                  label="Office Supplies"
                  labelPlacement="outside"
                  value={formData.officeSupplies}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="stationery"
                  label="Stationery"
                  labelPlacement="outside"
                  value={formData.stationery}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="softwareExpenses"
                  label="Software Expenses"
                  labelPlacement="outside"
                  value={formData.softwareExpenses}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="equipmentCost"
                  label="Equipment Cost"
                  labelPlacement="outside"
                  value={formData.equipmentCost}
                  onChange={handleChange}
                  min={0}
                />
                <Input
                  type="number"
                  name="insuranceCost"
                  label="Insurance Cost"
                  labelPlacement="outside"
                  value={formData.insuranceCost}
                  onChange={handleChange}
                  min={0}
                />
              </div>

              <div>
                <h3 className="font-medium">Utilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <Input
                    type="number"
                    name="electricity"
                    label="Electricity"
                    labelPlacement="outside"
                    value={formData.utilities.electricity}
                    onChange={handleUtilityChange}
                    min={0}
                  />
                  <Input
                    type="number"
                    name="internet"
                    label="Internet"
                    labelPlacement="outside"
                    value={formData.utilities.internet}
                    onChange={handleUtilityChange}
                    min={0}
                  />
                  <Input
                    type="number"
                    name="phone"
                    label="Phone"
                    labelPlacement="outside"
                    value={formData.utilities.phone}
                    onChange={handleUtilityChange}
                    min={0}
                  />
                  <Input
                    type="number"
                    name="water"
                    label="Water"
                    labelPlacement="outside"
                    value={formData.utilities.water}
                    onChange={handleUtilityChange}
                    min={0}
                  />
                </div>
              </div>

              <Divider />

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

export default EditOperationalExpense;
